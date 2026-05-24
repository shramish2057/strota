# Architecture Decision Records

ADRs document load-bearing architectural choices that future contributors should not undo without going through the same evaluation.

## Format

Each ADR lives in `docs/adr/NNNN-slug.md` with this skeleton:

```markdown
# ADR-NNNN: Title

- Status: proposed | accepted | superseded by ADR-MMMM
- Date: YYYY-MM-DD
- Phase: NN
- Owner: name or team

## Context

Background. What constraint, opportunity, or pain forced this decision.

## Decision

What we chose, in one or two sentences.

## Alternatives considered

Bullet list with why each was rejected.

## Consequences

What follows. Both gains and ongoing costs.

## Related

- Other ADRs, Bible sections, external references.
```

## Revising

Do NOT edit an accepted ADR in place. Create a new ADR with `Supersedes: ADR-NNNN` and flip the old one's status. The reasoning trail matters.

## Index

| # | Title | Status | Phase |
|---|-------|--------|-------|
| [0001](0001-platform-split-vercel-hetzner.md) | Next.js on Vercel + FastAPI + Postgres + Redis on a single Hetzner CCX53 | accepted (rev. 2026-05-24) | 1 |
| [0002](0002-inter-service-auth-defense-in-depth.md) | Inter-service auth: Cloudflare Tunnel + mTLS + HMAC + nonce | accepted | 1 |
| [0006](0006-self-hosted-postgres-and-custom-auth.md) | Self-hosted Postgres + custom auth (supersedes Supabase Auth in v5.0 Bible) | accepted | 2 |
| [0035](0035-hmac-skew-and-rotation-overlap.md) | HMAC skew 60s + nonce 120s TTL + rotation overlap + CRL | accepted | 1 |

Further ADRs land with their respective phases (see `strota_product_bible.md` v5.0 Part 9 for the full list 0001-0050).
