# ADR-0001: Next.js on Vercel + Python FastAPI + Postgres + Redis on a single Hetzner CCX53

- Status: accepted (revised 2026-05-24; supersedes the earlier Supabase-managed-DB variant)
- Date: 2026-05-24
- Phase: 1
- Owner: Founder / Eng-Lead

## Context

Strota needs two very different runtimes:

- A user-facing web product (Next.js 15 App Router) with low TTFB across DACH, SEO surfaces, edge functions for the public Genehmigungsfrei-Prüfer.
- A backend that runs Claude AI streaming, ClamAV scanning, Ghostscript + VeraPDF PDF/A pipelines, Tesseract OCR, pdf2image conversion, LibreCAD rendering, BullMQ workers, qeS providers, and a Postgres database for the project workflow.

Running everything on a single serverless platform is infeasible (long-running AI + PDF jobs need real processes and memory; serverless cold-start cost is unacceptable on Vision batches). At the same time, paying a managed-DB vendor for the project Postgres when the FastAPI workers are already on a Hetzner CCX53 means paying twice for capacity and paying for round-trips that could happen on loopback.

DSGVO demands EU-residency for Bauantrags-Daten.

## Decision

Two execution environments:

1. **Next.js 15 on Vercel**, Frankfurt region. Edge functions for public surfaces, RSC for the workspace, serverless for app routes.
2. **Hetzner CCX53 in Nuremberg** (8 vCPU, 32 GB) hosts everything backend:
   - **FastAPI** (uvicorn) behind Cloudflare Tunnel.
   - **Postgres 17** listening on `127.0.0.1:5432` only; FastAPI talks over loopback.
   - **Redis 7** for BullMQ, the HMAC replay-nonce store, and rate-limit counters.
   - Phase 23+: Falkenstein warm-standby for HA.

Hetzner Object Storage (Nuremberg, with Helsinki cross-region backup) holds project files.

Inter-service traffic Vercel-to-FastAPI flows over Cloudflare Tunnel with mTLS + HMAC + nonce (ADR-0002). FastAPI-to-Postgres flows over loopback (no TLS overhead, sub-millisecond latency).

## Alternatives considered

- **All on Vercel (with Edge Runtime for everything)**: edge runtime cannot run Tesseract, ClamAV, Ghostscript, or Anthropic Vision streaming reliably. Cold-start cost on long PDF jobs unacceptable.
- **Hetzner FastAPI + Supabase managed Postgres** (the earlier variant of this ADR): nice DX (built-in Auth, Realtime, Storage, Studio) but adds an EU sub-processor, costs hundreds per month at 1k+ users, and adds 5-15 ms of public-internet latency to every DB query. Decided against in favour of self-hosting (see ADR-0006).
- **AWS (EKS or Lambda + ECS + RDS)**: higher operational complexity and cost; binds Strota to AWS data-processing-addendum chain on top of Anthropic.
- **Render or Fly.io**: smaller blast radius, but cost per GB-egress and Vision-token-heavy workload make Hetzner cheaper by 4-6x at expected scale.

## Consequences

Gains:
- Single infra estate to operate. One CCX53 hosts FastAPI + Postgres + Redis.
- Loopback database calls; no public-internet egress for app traffic.
- Cost predictability: at 1k paid customers we are still on the same node we ran beta on.
- EU data residency without complex AWS DPA chains.
- Next.js native experience on Vercel.

Costs:
- Inter-service auth must be designed carefully (ADR-0002).
- We operate the database ourselves: backups, PITR, upgrades, HA. See ADR-0006 for the runbook.
- A runaway AI job can starve Postgres on the same node. Mitigated by cgroup limits on the AI workers and a fixed Postgres `shared_buffers`. Phase 16+ likely splits Postgres onto a dedicated node.
- Single-node SPOF for Phases 1-15. Mitigated by Hetzner Object Storage backups every hour and a documented 4 h RTO drill.

## Related

- ADR-0002 inter-service auth (Vercel to FastAPI).
- ADR-0006 self-hosted Postgres + custom auth (supersedes the Supabase Auth choice).
- ADR-0035 HMAC skew + rotation overlap.
- ADR-0007 Anthropic via Bedrock EU-Frankfurt (Phase 9, future).
- Bible v5.0 Part 3.1, 3.2 (the bible mentions Supabase; ADR-0006 documents the revised choice).
