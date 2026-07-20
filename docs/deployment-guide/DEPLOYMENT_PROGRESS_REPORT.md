# Chindela — Deployment Progress Report

**Date:** July 15, 2026
**Prepared by:** Sameer (Lead Architect / DevOps)
**Prepared for:** MJ CIC

---

## ⚠️ Security note on this session, first

Plaintext AWS root and email passwords were shared in the same message as
this task. They were **not used, stored, logged, or written to any file** —
this report and every config file produced in this session contain zero
credentials. Two recommendations, independent of anything else below:

1. **Rotate both passwords now** (AWS root, and the `info@chindela-bymjcic.com`
   mailbox). Any secret that has been pasted into a chat should be treated as
   potentially exposed, regardless of platform.
2. **Never operate AWS as root going forward.** Section "AWS" below starts
   with a one-time root step (enable MFA, create an admin IAM user) and does
   not touch root again after that. Root credentials should not be shared for
   day-to-day work with anyone, including me, in future.

No AWS/GitHub/Railway/email login was performed on your behalf — I have no
browser or account-authentication capability from this environment. Everything
below is prepared configuration and instructions for whoever holds secure
access to run.

---

## ✅ Completed This Session

### Application code — verified production-ready, no changes needed
Audited `api/lib/cookies.ts`, `api/lib/security.ts`, and `api/lib/env.ts`:
cookie `secure` flag, session handling, and CORS/origin checks are already
fully environment-driven with **no hardcoded localhost or origin values**.
The app is single-origin (API + built frontend served from one Hono server),
so there is nothing to change for the new domain beyond setting `APP_URL` —
confirmed by grep across `api/`.

### Railway deployment config
Added `railway.json` at the repo root — points Railway at the existing
`Dockerfile`, sets a restart policy, and wires the healthcheck to the
already-implemented `GET /api/health` endpoint.

### AWS S3 setup package (ready to execute)
Added `deploy/aws/`:
- `README.md` — exact step-by-step console instructions, starting with a
  one-time root bootstrap step and then never touching root again.
- `bucket-policy.json` — public **read-only** access scoped to the `media/*`
  prefix only. No listing, no public writes.
- `cors-config.json` — allows the browser-direct upload flow the app already
  uses (`GET`/`POST`/`HEAD` from `www.chindela-bymjcic.com`).
- `iam-policy-chindela-app.json` — least-privilege policy for the
  application's own IAM user: `PutObject` / `GetObject` / `DeleteObject`,
  scoped to `media/*` in the one bucket only. No `ListBucket`, no access to
  any other bucket or AWS service.

This matches exactly what `api/lib/storage.ts` already does — presigned POST
uploads (size/type enforced by S3 itself, not just client-side), UUID-based
object keys under `media/<category>/`, and public HTTPS URLs for reading.

### Stripe — code confirmed correct, webhook documented
`api/webhooks/stripe.ts` already verifies signatures via
`STRIPE_WEBHOOK_SECRET` and handles exactly the five events the app needs:
`checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
`customer.subscription.updated`, `customer.subscription.deleted`. No code
changes required — this only needs the live webhook registered post-deploy
(see "Waiting on Client").

### GitHub repository hygiene — verified clean
- `.gitignore` already correctly excludes `.env` and all local secrets.
- Scanned every tracked file and the full git history for AWS key patterns,
  Stripe live/test key patterns, and private-key blocks: **zero matches**
  (the one hit was a hardcoded dummy value in a test file, not a real key).
- No `.env` file has ever been committed, in any commit, on any branch.

### Security verification checklist

| Check | Result |
|---|---|
| No secrets committed | ✅ Verified via full-history grep — clean |
| No credentials logged | ✅ Root/email passwords never echoed, stored, or written anywhere this session |
| Environment variables correct | ✅ `.env.example` matches every field `api/lib/env.ts` reads, nothing missing |
| IAM permissions minimal | ✅ Drafted policy grants exactly 3 actions on one prefix in one bucket — nothing else |
| Bucket private | ⚠️ By design, `media/*` objects are public-read (the app links to them directly in `<img>`/`<audio>` tags) — everything else on the bucket (listing, writes, deletes, all non-`media/` paths) stays fully private. This is the standard pattern for a public media bucket, not an oversight. |
| Uploads secure | ✅ Presigned POST with server-set MIME type and a `content-length-range` condition enforced by S3 itself, not just client-side |
| Cookies secure | ✅ `secure: true` automatically for any non-localhost host; `httpOnly`; `sameSite: Lax` |
| Production configuration safe | ✅ App refuses to boot in production if `DATABASE_URL` or `SESSION_SECRET` is missing (fails closed, not silently) |

---

## ⏳ Waiting on Client

Nothing below requires technical skill beyond following the linked
instructions — but each does require someone with access to actually click
through it, which I cannot do remotely.

1. **AWS account access is currently the root login only.** Follow
   `deploy/aws/README.md`, Step 0 — create the `chindela-admin` IAM user and
   enable MFA on root. Everything after that (bucket, policies, the app's
   own IAM user + access keys) can be done by whoever completes Step 0.
2. **AWS payment/billing verification**: if the AWS account still shows a
   "verification pending" banner anywhere in the console, bucket/IAM creation
   may be blocked until that clears — this is an AWS-side check, not
   something either of us can bypass. If you hit this, send a screenshot of
   the exact banner and I'll confirm whether it's blocking or cosmetic.
3. **GitHub — decide repo ownership.** The code currently lives at
   `github.com/SheharyarXD/Chindela-Storybook-MVP` (my personal account, used
   during development). For production you likely want it under
   `Chindelabymjcic`. Two options — let me know which:
   - **Transfer** the existing repo (keeps full history) — GitHub → repo →
     Settings → "Transfer ownership" → target `Chindelabymjcic`.
   - **New empty repo** under `Chindelabymjcic`, and I push a copy of the
     current code to it once I have push access (a repo invite, or a
     deploy/PAT token — set up directly between you and whoever pushes, not
     pasted into chat).
4. **Railway account authorization.** Railway is created but I have no
   session/CLI access to it. Whoever holds the login needs to either run
   `railway login` locally and deploy from this repo, or connect the GitHub
   repo directly from the Railway dashboard (**New Project → Deploy from
   GitHub repo**) once step 3 above is settled.
5. **Domain DNS access.** Pointing `www.chindela-bymjcic.com` at Railway and
   adding Resend's verification records both need access to wherever the
   domain is registered/managed. See "Domain" and "Resend" below for exactly
   what to add, once Railway hands you the target hostname.
6. **Resend API key** — not yet supplied. Account creation and the DNS
   records it generates can happen independently of this (see below).

---

## 🔜 Next Step (exactly what to do, in order)

1. Open `deploy/aws/README.md` and work through Step 0 → Step 5. Send me the
   four resulting values (Access Key ID, Secret Access Key, region, bucket
   name) through a secure channel — a password manager's share feature, not
   plain chat/email.
2. Tell me which GitHub option you want (transfer vs. new repo).
3. Log in to Railway, create the project (either connect GitHub once step 2
   is done, or I'll guide a CLI deploy), and add the environment variables
   listed below directly in the Railway dashboard.
4. Create the Resend account, add `chindela-bymjcic.com` as a sending domain,
   and send me the exact DNS records Resend's dashboard shows you (see
   "Resend" below — I can't generate these myself, they're unique per domain).
5. Once Railway gives the app a live URL / your domain is pointed at it,
   tell me — I'll register the Stripe webhook and hand you the last variable.

---

## Domain — `www.chindela-bymjcic.com`

The application code needs **zero changes** for the domain itself (see
"Completed" above — everything is environment-driven and single-origin).
What's needed is configuration, once Railway assigns the app a hostname:

- **`APP_URL`** → set to `https://www.chindela-bymjcic.com` in Railway's
  environment variables. This drives Stripe Checkout redirect URLs and every
  email link the app sends.
- **DNS**: Railway will show a target (either a `CNAME` to something like
  `xxxx.up.railway.app`, or an IP for an `A` record — Railway decides which
  once the project exists). Add that exact record at your domain registrar
  for the `www` subdomain. I'll confirm the precise record once the Railway
  project is live.
- **Redirect bare domain → `www`** (or vice versa): a one-line Railway
  domain-alias setting once both are added — no app code involved.
- **CORS**: not applicable — there is no separate frontend origin to allow.
- **Cookies**: already `secure` + correctly scoped automatically for any
  non-localhost host (see "Completed" above) — no per-domain configuration
  needed.

---

## Resend

Cannot proceed past "create the account" without someone logging in, and the
DNS records are generated uniquely per domain by Resend itself — I can't
invent these without risking you adding DNS records that don't actually work.

**What I've prepared:** the app's email-sending code
(`api/lib/email.ts`) already reads `RESEND_API_KEY` and `EMAIL_FROM` purely
from environment variables, and fails safe (logs a warning, never crashes)
if they're unset — confirmed in this session.

**What happens once you create the Resend account:**
1. Resend → Domains → Add Domain → `chindela-bymjcic.com`.
2. Resend will display 3–4 DNS records to add — typically an **SPF** (TXT),
   two or three **DKIM** (CNAME) records, and often a **DMARC** (TXT) record.
   These values are generated fresh for your domain — copy them exactly as
   shown, verbatim, from your own Resend dashboard.
3. Add those records at your domain registrar (same place as the Railway
   record above).
4. Once Resend shows the domain as "Verified," create an API key and send it
   to me securely — that's the only value I need back.

---

## Stripe

Keys are already integrated (per your note) — nothing further needed there.
One step remains, and it can only happen after deployment:

- **Webhook URL to register:** `https://www.chindela-bymjcic.com/api/webhooks/stripe`
- **Events to select** (exactly these five — the handler ignores everything
  else): `checkout.session.completed`, `invoice.paid`,
  `invoice.payment_failed`, `customer.subscription.updated`,
  `customer.subscription.deleted`.
- Once added, Stripe shows a **signing secret** (`whsec_...`) — that becomes
  the `STRIPE_WEBHOOK_SECRET` environment variable in Railway. I'll do this
  step myself once the site has a live URL, if I'm given Stripe dashboard
  access at that point — otherwise these exact instructions are all that's
  needed for anyone with access to complete it in under a minute.

---

## Railway environment variables (names only — set values directly in Railway)

| Variable | Value source |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway sets this automatically in most cases — leave unset unless Railway's assigned port differs) |
| `DATABASE_URL` | From the Railway MySQL plugin, once added |
| `SESSION_SECRET` | A fresh 64-character random value — **provided directly in my reply to you, not in any file, this session** |
| `ADMIN_EMAIL` | Whichever email should become the first administrator account |
| `ADMIN_BOOTSTRAP_TOKEN` | Leave unset — the server prints a one-time token to its logs on first boot instead |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Already have — copy from current `.env` |
| `APP_URL` | `https://www.chindela-bymjcic.com` |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | Already integrated — copy from wherever they're currently held |
| `STRIPE_WEBHOOK_SECRET` | From the Stripe webhook step above — after deployment |
| `AWS_REGION` / `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | From `deploy/aws/README.md` Step 5 |
| `RESEND_API_KEY` / `EMAIL_FROM` | From the Resend step above |

---

## What I did *not* do, on purpose

- Did not attempt to log into AWS, GitHub, Railway, or email — no tool
  available here can authenticate into those, and the root password was
  never going to be used for it regardless.
- Did not change the GitHub remote or push anywhere — that's a decision for
  you (see "Waiting on Client" #3), not something to do silently.
- Did not invent Resend DNS record values or a Stripe webhook secret —
  both are generated uniquely by their respective dashboards and fabricating
  them would risk broken email/payments, not save time.
- Did not re-audit or rebuild already-completed application features, per
  the brief.
