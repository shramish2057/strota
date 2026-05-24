# ADR-0006: Self-hosted Postgres + custom auth (supersedes Supabase Auth in v5.0 Bible)

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Founder / Eng-Lead
- Supersedes: the bible's v5.0 Part 3.2 entry that picked Supabase Auth + Supabase managed Postgres.

## Context

v5.0 of the bible picked Supabase for six things at once: Postgres, Auth, Realtime, Storage, Studio, PITR. That bundle is genuinely useful at idea-stage but it became the single largest sub-processor decision Strota was making, with knock-on effects:

- **Money**: at 1k paid customers, Supabase Team tier with adequate PITR + read replicas is €500-1500/mo. Self-hosting on the same Hetzner CCX53 that already runs FastAPI is a marginal cost of zero.
- **Latency**: Hetzner-to-Supabase is public-internet, even within the EU. 5-15 ms extra on every DB query. Loopback Postgres is <1 ms.
- **DPA chain**: Supabase, Cloudflare-in-front-of-Supabase, and the underlying AWS account are three sub-processors we are adding for the database alone.
- **Lock-in**: gotrue patterns (e.g. `auth.uid()`, the row-level `request.jwt.claim.sub` convention) bleed into application code.
- **Realtime + Storage** turn out to be deferrable: file uploads use Hetzner Object Storage with presigned URLs (already in v5.0); live updates are not needed until Phase 6 and can be SSE from FastAPI when they are.

## Decision

Self-host the database and write the auth layer ourselves.

- **Postgres 17** on the Hetzner CCX53, listening only on `127.0.0.1`. FastAPI talks to it on loopback. Hourly `pgbackrest` snapshots to Hetzner Object Storage; 30-day PITR window; weekly verified restore drill.
- **Custom auth in FastAPI** (under `apps/api-python/src/strota_api/auth/`):
  - `auth.users` is a real Strota-owned table with `password_hash` (argon2id), `email_verified_at`, lockout counters, etc.
  - Per-flow token tables: `email_verification_tokens`, `password_reset_tokens`, `magic_link_tokens`, `refresh_tokens`. Only the SHA-256 hash of each token is stored; a DB leak yields no usable tokens.
  - Stateless JWTs (HS256 for Phase 2, key rotation via secret-overlap pattern same as ADR-0035; RS256 considered if multi-issuer needs arise).
  - Rotating refresh tokens with family tracking (any reuse of a revoked refresh token revokes the whole family - the standard OAuth2 best-practice).
  - Argon2id password hashing (memory cost `19456 KiB`, iterations `2`, parallelism `1`; tuned per OWASP 2025 baseline).
  - Email delivery via Postmark (German templates land in `db/templates/` and `apps/api-python/src/strota_api/auth/emails/`).
- **RLS unchanged**: every project-scoped table uses `auth.uid()` which reads `request.jwt.claim.sub`. FastAPI sets that claim per-connection via `SET LOCAL` after verifying the JWT. RLS is therefore defense-in-depth even if an application handler forgets an `org_id` filter.

## Alternatives considered

- **Pure Supabase managed**: rejected; see Context. Faster to ship by ~1 week; long-term cost and lock-in dominate.
- **Hetzner Postgres + Authentik / Ory Kratos / Keycloak**: rejected; each is a serious piece of infrastructure to operate and customise. We deliberately keep auth small and code-reviewable.
- **Hetzner Postgres + self-hosted gotrue container**: closer to "Supabase without the SaaS bill". Reasonable but commits us to gotrue's data model and HTTP shape. We prefer to own the few endpoints we actually need.

## Consequences

Gains:
- One sub-processor removed from the DPA chain (Supabase + AWS-under-Supabase both gone).
- Loopback DB latency; no public-internet egress for the project workflow.
- Auth code is small (a few hundred lines) and reviewable line-for-line; no opaque vendor service in the request path for login or session.
- Cost: at 1k customers, ~€60/mo total Hetzner instead of €500+/mo Supabase. By Phase 16 we likely split Postgres onto a dedicated CCX23 (~€40/mo extra) for headroom.

Costs:
- We operate Postgres ourselves: `pgbackrest` + restore drills (weekly), upgrades (twice-yearly), kernel/CVE patching, `shared_buffers` and `effective_cache_size` tuning.
- We operate auth: every flow (signup, verify, login, magic link, password reset, refresh-token rotation, lockout, token revocation) is our code. CodeQL + bug-bounty cover blast-radius.
- No Realtime or Studio out of the box. Studio replaced by pgAdmin / DataGrip / psql; Realtime added in Phase 6 via Server-Sent Events from FastAPI when needed.

## Implementation notes

- Token plaintexts use `secrets.token_urlsafe(32)` (256 bits); stored as `sha256(plaintext)` hex.
- JWT access tokens: 15 minute TTL.
- Refresh tokens: 30 day TTL, rotated on every use, revoked on logout or family-reuse detection.
- Rate limits: 5 failed logins per email per hour triggers a 15-minute lockout; surfaced in `auth.users.failed_login_attempts` + `locked_until`.
- Password policy: min 12 chars (per `db/migrations/005_self_hosted_auth.sql` + FastAPI validator). HIBP-pwned-passwords check optional (Phase 16+).
- Email verification + password reset tokens: 24 h TTL.
- Magic links: 15 minute TTL, single-use, invalidates other active magic links for the same user.
- All cookies issued by FastAPI are `HttpOnly`, `Secure`, `SameSite=Lax`, with the access JWT in a short-lived cookie and the refresh token in a separate `Path=/api/auth/refresh` cookie.

## Related

- ADR-0001 platform shape (revised to single-node Hetzner).
- ADR-0035 secret-rotation overlap pattern (HMAC); JWT signing key uses the same pattern.
- Bible v5.0 Part 3.2 mentions Supabase; this ADR documents the divergence.
- `db/migrations/005_self_hosted_auth.sql`, `apps/api-python/src/strota_api/auth/`.
