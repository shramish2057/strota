# ADR-0002: Inter-service auth (Vercel <-> FastAPI) defense in depth

- Status: accepted
- Date: 2026-05-24
- Phase: 1
- Owner: Founder / Eng-Lead

## Context

The FastAPI service handles Bauherr-PII, qeS keys (Phase 20), and AI-routed Bauantragsunterlagen. A single shared HMAC secret would be one rotation incident away from full compromise. A simple Cloudflare Tunnel would terminate at the origin without per-deploy identity. Neither alone is enough.

The threat model we defend against:

- Stolen Vercel build env vars (-> attacker can forge HMAC).
- Stolen Hetzner origin IP / firewall misconfig (-> attacker hits API directly).
- Replay attack within a valid skew window.
- Compromised in-flight Vercel deployment (need ability to revoke a specific deploy).
- Clock drift between Vercel edge and Hetzner origin causing false rejects.

## Decision

Four layers, all required:

1. **Cloudflare Tunnel.** FastAPI has no public IP. Cloudflare terminates the public TLS connection and re-establishes mTLS to the Hetzner origin.
2. **mTLS client cert.** Per-deployment ed25519 key pair in Vercel build env. FastAPI validates the cert's SHA-256 fingerprint against an allowlist. A Redis-backed CRL (`mtls:revoked_serials`) can revoke a specific deployment within seconds.
3. **HMAC-SHA256 signature** of `${timestamp}.${nonce}.${sha256_hex(body)}` (canonical form, Phase 1 packages/shared/src/hmac.ts and apps/api-python/src/strota_api/security/hmac.py).
4. **Replay nonce** stored in Redis via `SET nonce:<value> 1 NX EX <ttl>`. NX is atomic, so concurrent replays inside the skew window all lose to the first.

Rotation atomicity per ADR-0035.

## Alternatives considered

- **HMAC only**: cannot revoke a compromised deployment without rotating the global secret. No transport-layer identity.
- **mTLS only**: cert pinning is brittle across edge networks; HMAC adds per-request integrity.
- **JWT bearer tokens**: stateless and weaker against replay (no per-request signature over body); also adds key-management surface.
- **AWS Signature v4 style**: similar guarantees but tied to AWS tooling; we are Hetzner-first.

## Consequences

Gains:
- Compromise of any single layer does not yield API access.
- Per-deployment revocation in seconds.
- Body integrity guaranteed; replays prevented atomically.

Costs:
- Extra round-trip latency for nonce SET (Redis is in the same DC, <2 ms).
- Operational complexity: rotation cron, CRL management, mTLS cert lifecycle tied to Vercel deploys.
- Local development requires either disabling the auth (env-driven empty allowlist) or running the full stack with cloudflared.

## Related

- ADR-0001 platform split.
- ADR-0035 HMAC skew + rotation overlap + CRL.
- Bible v5.0 Part 3.1.
- packages/shared/src/hmac.ts.
- apps/api-python/src/strota_api/middleware/auth.py.
