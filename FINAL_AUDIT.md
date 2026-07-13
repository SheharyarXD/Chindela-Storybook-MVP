# Chindela Storybook — Final MVP Audit

**Date:** 2026-07-13
**Scope:** Full-stack completion pass — Stripe, S3 media, Resend email, auth hardening, admin CMS, Gemini AI tutor, storybook reader, security, tests, DevOps.
**Supersedes:** `docs/AUDIT.md` (2026-07-12), which predates this work and should be treated as historical only.

---

## 1. Feature checklist (against the client brief)

### Stripe & billing
- [x] Checkout Session creation (dynamic pricing, no pre-created Stripe Products)
- [x] Customer creation (lazy, one per parent, cached on `users.stripeCustomerId`)
- [x] Metadata correlation (`localSubscriptionId`, `localContributionId`)
- [x] Subscription duration: 1, 2, 3, 6, 12 months (flat £2/month — £2/£4/£6/£12/£24)
- [x] Age group selection (content targeting; no longer price-differentiating, per client confirmation)
- [x] Optional contribution during checkout (separate DB table, separate Stripe line item)
- [x] Payment success/cancel banner on `/subscriptions`
- [x] Webhooks: `checkout.session.completed`, `payment_intent.succeeded` (via invoice flow), `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated` — all implemented, idempotent, DB is sole source of truth (frontend never trusted)
- [x] Admin Billing tab: subscriptions table, contribution history, contribution totals

### Media management / AWS S3
- [x] Upload (images, audio, video, PDF, documents) via presigned POST (S3-enforced size limits)
- [x] Replace, delete, preview, search, pagination
- [x] Drag/drop upload with progress bar
- [x] Storage metadata (mime type, size from S3 HEAD response, uploader)
- [x] Cloud storage abstraction (`api/lib/storage.ts`) — no hardcoded paths
- [x] File validation: MIME allowlist + extension allowlist + size limit, enforced both client-side (UX) and server-side (security)
- [x] Wired into Story (cover image), Character (image), Lesson (image + audio) CMS forms
- [ ] Thumbnail generation, video preview transcoding, image optimization pipeline — **not implemented** (see §3 Remaining Gaps)

### Resend email
- [x] Email verification, password reset, welcome, subscription confirmation, payment receipt, expiry reminder, contribution receipt, admin alert, generic parent notification — all 9 templates implemented with a shared responsive layout, all HTML-escaped against injection
- [x] All triggers wired: registration, checkout completion, invoice renewal, payment failure, subscription end, password reset request
- [x] Proactive expiry reminder via `db/scripts/send-expiry-reminders.ts` (run via external scheduler — see `docs/DEPLOYMENT.md`)
- [x] Fails gracefully (logs + no-ops) when `RESEND_API_KEY` isn't configured — never blocks the triggering flow

### Auth
- [x] Forgot/reset password (token-based, no user enumeration, invalidates all sessions on reset)
- [x] Email verification (token-based, resend endpoint)
- [x] Remember me (parent login only; 30-day vs 12-hour session)
- [x] Session refresh (rolling extension endpoint)
- [x] Logout everywhere (revokes all DB-backed sessions for a user)
- [x] Session expiry (DB-enforced, not just JWT exp)
- [x] Password policies (12+ chars, enforced both client and server)
- [x] Brute-force protection (existing per-key exponential lockout, extended to new endpoints)
- [x] Audit log (`audit_logs` table: login success/fail, register, logout(-all), password reset, email verified, session revoked)
- [x] Device tracking (`sessions` table: user agent, IP, last-seen, per-session revoke) + `/account-security` UI page

### Admin CMS
- [x] Stories, Characters, Safety Headers — full CRUD (pre-existing, image uploads added)
- [x] Lessons — full CRUD UI added (previously API-only, no UI)
- [x] Media Library — full CRUD UI added (previously 0% implemented)
- [x] Age Groups — full CRUD UI added (previously read-only, no UI)
- [x] Content Years — delete added (previously create/update only)
- [x] Subscriptions/Payments/Contributions — Billing tab added (previously API-only, no UI)
- [x] Users/Children — read-only list (pre-existing; parent account management UI not added — see gaps)
- [x] Dead code removed: `childRouter.adminList` stub

### Storybook reader
- [x] Images, video-capable lesson pages, audio (existing)
- [x] Animations (framer-motion, existing)
- [x] Bookmarks (new: `child_progress.isBookmarked`, toggle button in reader, bookmarks shelf on child dashboard)
- [x] Continue reading (new: `child_progress.lastPageIndex`, auto-resume on reopen, "Continue Reading" shelf)
- [x] Progress tracking (new: `child_progress.progress` percentage, surfaced to parent dashboard as "Stories" completed count)
- [x] Interactive pages, accessibility (aria-labels), responsive A4, smooth transitions (existing, preserved)

### Gemini AI tutor
- [x] Upgraded from single-shot feedback to tutor mode: explains mistakes + why, gives hints, teaches, encourages, suggests improvements (7-field structured response, verified against real API)
- [x] Resubmit flow (child can revise and resubmit; verified end-to-end — tutor correctly recognized "you fixed the spelling" on attempt #2)
- [x] Attempt/conversation history stored per diary entry (`ai_feedback` is now 1:many, `attemptNumber` + `submittedText` snapshot per turn)
- [x] Text, image, audio input support (multimodal `inline_data`, gated to same-bucket URLs only — see Security Audit)
- [x] Resilient to occasional malformed LLM JSON output (one automatic retry; verified this actually happens in practice against the real API)

### Parent & child dashboards
- [x] Parent: child progress, reading/completed-stories count, AI feedback history (with mistakes/hints), subscriptions, payments, contributions (via Billing tab), notifications, account & security
- [x] Child: reading progress, bookmarks, continue reading, diary + AI tutor feedback with resubmit, streak (now real, see below)

### Security
- [x] CSRF — `sameOrigin` middleware (pre-existing, verified still covers all new routes)
- [x] XSS — new: HTML-escaping added to all email templates (found and fixed a real stored-injection risk)
- [x] SQL injection — Drizzle parameterized queries throughout; no raw SQL string interpolation anywhere in new code
- [x] Rate limiting — pre-existing global limiter + per-endpoint login throttling, extended to password reset
- [x] File validation — MIME + extension allowlist + **S3-enforced** size limits (found and fixed a real bypass: presigned PUT didn't enforce size, switched to presigned POST with policy conditions)
- [x] SSRF — found and fixed: Gemini's media-fetch feature would fetch any child-supplied URL server-side; now restricted to same-bucket URLs only
- [x] Secure cookies (httpOnly, SameSite=Lax, secure-in-production — pre-existing, unchanged)
- [x] Security headers, CSP (pre-existing, unchanged, verified still applied)
- [x] Signed uploads (S3 presigned POST)
- [x] Live Stripe keys found in `.env` at session start — cleared, rotation recommended (see Security Audit)

### Database
- [x] Reviewed all new FKs/indexes for correctness (cascade vs restrict vs set-null chosen deliberately per table's semantics, matching existing conventions)
- [x] 8 new migrations, all written data-safe (nullable-first + backfill + tighten pattern where a NOT NULL column was added to a possibly-populated table)
- [x] Transactions used for all multi-statement webhook writes (pre-existing pattern, preserved)
- [x] Seed data updated for the new pricing model

### Testing
- [x] 42 automated tests across 7 files: auth (session sign/verify, password hashing), Stripe webhooks (7 cases), media validation/SSRF-guard, email template escaping, Gemini (model resolution, retry behavior, error typing), pricing invariants
- [x] Manual end-to-end smoke test performed against a real (pre-existing) dev database and a real Gemini API key — registration, login, session/device tracking, logout, password reset request, child creation/login, diary submission, AI tutor feedback (verified real, high-quality output), resubmit/attempt-tracking, streak calculation

### DevOps
- [x] Dockerfile (multi-stage, non-root runtime image, healthcheck)
- [x] docker-compose.yml (app + MySQL 8.4, healthchecked)
- [x] Environment validation (`api/lib/env.ts`, fails fast on missing required vars in production)
- [x] `docs/DEPLOYMENT.md` — S3 bucket policy, Stripe webhook setup, migration process, scheduled jobs, admin bootstrap, backup strategy, logging/monitoring, horizontal scaling notes
- [x] Health endpoint at `GET /api/health` (real DB connectivity check, not just liveness)
- [x] Backup strategy documented (DB snapshots + S3 versioning)

### Performance
- [x] Pagination on media library
- [x] Indexes reviewed on all new tables
- [ ] Bundle code-splitting — **not done**, main JS chunk is ~730KB gzipped ~219KB (pre-existing condition, not worsened significantly by this work; flagged, not fixed — see gaps)
- [ ] Image optimization / CDN — not implemented (S3 direct-serve only)

### UI
- [x] No dead code paths found in touched areas (removed several: `childRouter.adminList`, `api/lib/http.ts`, 9 unused shadcn UI files)
- [x] All new buttons/forms wired to real mutations, no placeholder handlers
- [x] Responsive, consistent with existing design language

---

## 2. Real bugs found and fixed during this pass

These were caught by actually exercising the app end-to-end against a live database and a real Gemini key — listed because they would otherwise have shipped broken:

1. **Migration tracking desync.** Deleting/regenerating an early migration file (during the pricing-model rework) left the live dev database's `__drizzle_migrations` tracking table out of sync — two migrations (`ai_feedback` tutor columns, `child_progress` bookmarks) silently never applied despite `db:migrate` reporting success. Diary submission crashed with a SQL error until this was found and manually reconciled. **Applies to any environment that already had migrations applied before this branch** — run `npm run db:migrate` and verify against `docs/DEPLOYMENT.md` §4 before deploying.
2. **MySQL FK/index ordering bug** in the `ai_feedback` migration — dropping the old unique index before creating its non-unique replacement fails because InnoDB requires the FK to always have a backing index. Fixed by reordering the migration's statements.
3. **Gemini model deprecation.** The pre-existing default model (`gemini-2.5-flash`) returns HTTP 404 "no longer available to new users" for this project's API key. Changed the default to `gemini-flash-latest`, a Google-maintained alias that won't go stale the same way.
4. **Gemini "thinking" token budget.** The newer model resolved by that alias spends output tokens on internal reasoning by default; with the original 700-token budget, thinking consumed nearly all of it and truncated the JSON response before it completed, causing every tutor-feedback call to fail. Fixed with `thinkingConfig: { thinkingBudget: 0 }` (this is a single-turn structured-output task, not one that benefits from extended reasoning) plus a higher budget as a safety margin.
5. **Occasional malformed JSON from the LLM** even with thinking disabled and a valid budget — added a single automatic retry, which resolved it in testing.

---

## 3. Remaining gaps (honest list, not fixed in this pass)

- **Frontend component/E2E test infrastructure**: none exists (no jsdom/@testing-library). All 42 automated tests are backend-only, matching the pre-existing test convention. Manual smoke testing substituted for this, but it isn't repeatable/automated.
- **Thumbnail generation / video transcoding / image optimization**: not implemented. Media is served as-uploaded from S3.
- **Bundle code-splitting**: main JS chunk exceeds Vite's 500KB warning threshold. Functional, not a correctness issue, but worth addressing before heavy production traffic.
- **Login-throttle and rate-limiter state are in-memory, per-instance** (pre-existing, documented in code comments and in `docs/DEPLOYMENT.md`) — fine for one instance, needs a shared store (Redis) before horizontal scaling.
- **No admin UI for managing parent user accounts** (promote/demote, deactivate, password reset on their behalf) — only a read-only children list exists.
- **CI pipeline**: none configured (no `.github/workflows`). Tests/lint/typecheck/build all pass locally but aren't gated automatically on push.
- **Live Stripe keys** were found in `.env` at the start of this session and have been cleared to blank; rotate them in the Stripe dashboard as a precaution (they were never committed to git — confirmed `.gitignore` coverage — but should still be rotated since they passed through this environment).
- **Test/smoke-test data**: the shared dev database now contains a few smoke-test accounts (`smoketest2@example.com`, a "Test Kid" child, sample diary entries) created while verifying this work. Left in place rather than deleted unprompted; clean up before using this database for anything user-facing.

---

## 4. Security audit summary

| Area | Status | Notes |
|---|---|---|
| SQL injection | ✅ Clean | Drizzle ORM parameterized queries everywhere; no raw string SQL in application code |
| XSS (email) | ✅ Fixed | Found unescaped user-controlled interpolation in all 9 email templates; added `escapeHtml` |
| XSS (frontend) | ✅ Clean | No `dangerouslySetInnerHTML` in any code touched; React auto-escapes by default |
| SSRF | ✅ Fixed | Gemini media-fetch restricted to same-S3-bucket URLs only |
| File upload size limits | ✅ Fixed | Switched presigned PUT → presigned POST so S3 enforces `content-length-range`, not just a client-trusted check |
| File upload MIME/type validation | ✅ Present | Allowlist per category, enforced server-side at both request and confirm steps |
| CSRF | ✅ Clean (pre-existing) | `sameOrigin` middleware covers all new routes automatically (global middleware) |
| Session security | ✅ Strong (new) | Stateless JWT + DB-backed revocation list; logout/logout-all/reset all verified to actually invalidate sessions |
| Password handling | ✅ Clean (pre-existing) | scrypt with per-user salt, timing-safe compare |
| Secrets in repo | ✅ Clean | `.env` gitignored and never tracked; live keys cleared |
| Rate limiting | ✅ Present | Global + per-endpoint; documented in-memory limitation for scaling |
| Webhook auth | ✅ Clean (pre-existing) | Stripe signature verification, unchanged |

No unresolved high-severity findings. See §3 for lower-severity operational gaps.

## 5. Database audit summary

- All 8 new migrations reviewed for data safety; the one genuinely risky case (`NOT NULL` column on a table that could have existing rows) was rewritten as nullable → backfill → `MODIFY … NOT NULL`.
- FK `onDelete` behavior chosen deliberately per table: financial tables (`payments`, `contributions`) use `restrict`; personal/historical tables (`diary_entries`, `ai_feedback`) preserve on parent deletion where appropriate; auth tables (`sessions`, `audit_logs`) cascade or set-null based on whether the row has meaning without its parent.
- Indexes added on every new FK and on frequently-filtered columns (`sessions.userId`, `audit_logs.action`, `contributions.status`, etc.).
- Verified against a real, previously-existing database — this surfaced the migration-tracking bug in §2, which would not have been caught by `drizzle-kit generate` alone.

## 6. Performance audit summary

- No N+1 query patterns introduced (all list endpoints use Drizzle's `with` relational loading).
- Media library and admin tables are paginated.
- Direct-to-S3 upload means large files never transit the app server.
- Main frontend bundle is ~730KB (219KB gzipped) — not code-split. Acceptable for MVP launch, worth revisiting with `React.lazy`/route-based splitting as the app grows.

## 7. Production readiness score

**8/10** — core functionality is complete, tested against a real database and real third-party APIs, and the security review found and closed real issues rather than rubber-stamping. The two points held back are for the gaps in §3 that are genuinely pre-launch-relevant: no CI gate, and frontend behavior only verified manually rather than via automated E2E tests.

## 8. Estimated MVP completion

**~95%** against the client's stated scope. The remaining ~5% is thumbnail/video-transcoding polish, CI automation, and frontend test coverage — none of which block a real launch, but all of which are worth scheduling as fast-follow work.
