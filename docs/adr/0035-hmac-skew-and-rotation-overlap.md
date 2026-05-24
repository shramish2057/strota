# ADR-0035: HMAC skew 60s, nonce TTL 120s, rotation overlap, CRL

- Status: accepted
- Date: 2026-05-24
- Phase: 1
- Owner: Founder / Eng-Lead

## Context

The v4.0 design used a 30-second skew window and 60-second nonce TTL. In practice:

- NTP drift between Vercel edge and Hetzner origin is occasionally up to 5s.
- Mobile submissions (architect uploading from a construction site) traverse cellular and Bauamt-WiFi paths with variable latency; a request signed at T can arrive at T+10s reliably and at T+30s sometimes.
- A monthly secret rotation that flips both sides at the same instant causes a brief outage window for in-flight Vercel deployments.
- A compromised deployment with valid mTLS cert has no fast revocation path.

## Decision

1. **HMAC skew** = 60 seconds. (v4.0: 30s; v5.0: widened for NTP + mobile reality.)
2. **Nonce TTL** = 120 seconds. (= 2 x skew so replays across boundary still fail.)
3. **Rotation overlap window** = 24 hours. FastAPI accepts both `HMAC_SECRET` and `HMAC_SECRET_PREVIOUS` during overlap. CI rotates by writing the new secret, deploying, and only retiring the old secret after a successful round-trip canary.
4. **CRL** = Redis SET `mtls:revoked_serials` (lowercase hex SHA-256 fingerprints). Middleware checks membership on every authenticated request. Eviction policy: members stay until manually removed (defense first, cost later).

## Alternatives considered

- **Keep 30s skew**: fewer replay options, but real false-reject rate too high.
- **No overlap window (instant rotation)**: deployment outage every rotation.
- **Per-request OCSP for mTLS**: heavyweight, adds external dependency for a low-frequency event.
- **CRL in Postgres**: slower lookup path; Redis is already on the hot path for the nonce store.

## Consequences

Gains:
- Realistic skew tolerance without weakening replay protection.
- Zero-downtime monthly rotation.
- Sub-second deployment revocation.

Costs:
- Two secrets to manage during overlap.
- Slightly larger replay window (120s vs 60s); mitigated by nonce uniqueness and audit log.

## Related

- ADR-0002 inter-service auth.
- packages/shared/src/hmac.ts (TS verifier supports `secretPrevious`).
- apps/api-python/src/strota_api/security/hmac.py (Python verifier supports `secret_previous`).
- apps/api-python/src/strota_api/middleware/auth.py (CRL check before HMAC step).
- Bible v5.0 Part 3.1.
