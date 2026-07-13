# Deployment Guide

## 1. Required environment variables

See `.env.example` for the full list. At minimum, production requires:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SESSION_SECRET` | 32+ random characters. Rotating it invalidates every existing session. |
| `ADMIN_EMAIL` | The address that becomes the platform administrator on first registration |
| `APP_URL` | Public base URL, used to build email links (verification, reset, checkout redirects) |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Use **test-mode** keys until you are ready to take real payments |
| `AWS_REGION` / `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Media uploads (images/audio/video/pdf/documents) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email. Verify your sending domain in Resend before going live, or deliverability will suffer. |
| `GEMINI_API_KEY` | AI tutor feedback on diary entries |

Every third-party integration (Stripe, S3, Resend, Gemini) fails **gracefully** if unconfigured — the app still boots and other features keep working, but that specific feature returns a clear error (or silently no-ops, for email) instead of crashing. Check server logs after deploy to confirm nothing was left unconfigured by mistake.

## 2. AWS S3 bucket setup (required for media uploads)

The bucket must allow public read of objects under `media/*` (story/character/lesson assets are rendered directly via `<img>`/`<audio>`/`<video>` src URLs) while keeping writes locked to the app's IAM credentials.

1. Create a bucket named exactly `AWS_S3_BUCKET`, in region `AWS_REGION`.
2. Block Public Access settings: uncheck "Block public access to buckets and objects granted through new public bucket or access point policies" (or add a bucket policy scoped to `media/*` — do not make the whole bucket public).
3. Attach a bucket policy such as:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadMedia",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::YOUR_BUCKET/media/*"
     }]
   }
   ```
4. Configure CORS on the bucket to allow `PUT`/`POST` from `APP_URL` (uploads go directly from the admin's browser to S3 via a presigned POST):
   ```json
   [{ "AllowedOrigins": ["https://your-app-domain"], "AllowedMethods": ["POST", "PUT"], "AllowedHeaders": ["*"] }]
   ```
5. Create an IAM user/role with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:HeadObject` scoped to `arn:aws:s3:::YOUR_BUCKET/*`, and use its access key for `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`.

Upload size limits are enforced by S3 itself (via a presigned POST policy's `content-length-range` condition, not just client-side JS), so this is safe even against a malicious or compromised admin session.

## 3. Stripe setup

1. Create products aren't needed — pricing is computed dynamically per checkout (flat £2/month × duration).
2. In the Stripe Dashboard, add a webhook endpoint pointing at `${APP_URL}/api/webhooks/stripe` subscribed to: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. For local testing, use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and copy the printed webhook secret.
4. Test-mode card: `4242 4242 4242 4242`, any future expiry, any CVC.

## 4. Database migrations

Migrations live in `db/migrations/` and are applied with drizzle-kit, which is a **dev dependency** — run it from an environment with the full `node_modules` installed (the CI/build step, or a throwaway `docker build` target), not from the slim production runtime image.

```bash
npm ci
npm run db:migrate
```

Run migrations **before** starting the new app version. Every migration in this repo has been written to be safe against existing data (nullable-first + backfill + tighten, rather than a bare `NOT NULL` on a populated table) — see individual `.sql` files under `db/migrations/` for the pattern.

## 5. Building and running

### Docker (recommended)

```bash
docker compose up --build
```

This starts a MySQL 8.4 container and the app, wired together via `docker-compose.yml`. Put real secrets in a local `.env` file (never commit it) — it's loaded via `env_file` for the `app` service.

Run migrations once the `db` service is healthy:
```bash
docker compose run --rm app sh -c "npm ci && npm run db:migrate"
```
(or run `npm run db:migrate` locally against the exposed `3306` port).

### Bare metal / VM

```bash
npm ci
npm run build
npm run db:migrate
npm start
```

The health check is a plain REST endpoint at `GET /api/health` (not behind tRPC/rate-limiting) — point your load balancer / orchestrator at it. It returns `200 {"ok":true,"database":true}` when the app can reach the database, `503` otherwise.

## 6. Scheduled jobs

`db/scripts/send-expiry-reminders.ts` sends a "your subscription ends soon" email + in-app notification for subscriptions ending within 3 days that aren't set to auto-renew. Run it once daily via your platform's scheduler (cron, a scheduled Lambda, a Render/Railway cron job, etc.):

```bash
npx tsx db/scripts/send-expiry-reminders.ts
```

## 7. Admin bootstrap

The first account registered with `ADMIN_EMAIL` becomes the administrator — but registration additionally requires a bootstrap token, printed once to server logs on first boot (`=== Admin bootstrap token ... ===`), or pinned in advance via `ADMIN_BOOTSTRAP_TOKEN`. This prevents anyone else from registering `ADMIN_EMAIL` first and permanently squatting on the admin role. Register at `${APP_URL}/login?admin=1` and paste the token into the "Admin bootstrap token" field.

## 8. Backup strategy

- Take automated daily MySQL snapshots (RDS automated backups, or `mysqldump` to S3/off-box storage on a cron). Retain at least 7 daily + 4 weekly.
- Media in S3 should have versioning enabled on the bucket so an accidental admin delete/replace is recoverable within the versioning retention window.
- `SESSION_SECRET` and Stripe/AWS/Resend keys should live in a secrets manager (not just `.env` on disk) in any real production deployment.

## 9. Logging & error monitoring

The app logs to stdout/stderr (`console.log`/`console.error`) — in Docker/Kubernetes this is picked up automatically by the container runtime's log driver. For production, ship stdout to a log aggregator (CloudWatch Logs, Datadog, Better Stack, etc.) and wire an error-tracking SDK (e.g. Sentry) into `api/boot.ts` if you need alerting beyond log search — none is bundled by default to avoid adding a hard dependency on a specific vendor.

## 10. Horizontal scaling notes

- Sessions, audit logs, and login-throttle state: sessions/audit logs are DB-backed (safe to scale horizontally); the login-throttle lockout counters are **in-memory per instance** (documented in `api/lib/loginThrottle.ts`) — acceptable for a single instance, but move to a shared store (Redis) before running multiple app instances behind a load balancer, or a determined attacker could round-robin across instances to bypass the lockout.
- The global rate limiter (`api/lib/security.ts`) has the same in-memory-per-instance characteristic.
