# ADR-0001: Next.js on Vercel + Python FastAPI on Hetzner

- Status: accepted
- Date: 2026-05-24
- Phase: 1
- Owner: Founder / Eng-Lead

## Context

Strota needs two very different runtimes:

- A user-facing web product (Next.js 15 App Router) with low TTFB across DACH, SEO surfaces, edge functions for the public Genehmigungsfrei-Prüfer.
- A heavy backend that runs Claude AI streaming, ClamAV scanning, Ghostscript + VeraPDF PDF/A pipelines, Tesseract OCR, pdf2image conversion, LibreCAD rendering, BullMQ workers, qeS provider integrations.

Running both on a single serverless platform is infeasible. The PDF and AI workloads need long-running processes, large memory, and predictable cost per request. The web product benefits from Vercel's edge network and Next.js native integration.

DSGVO demands EU-residency for Bauantrags-Daten.

## Decision

Two execution environments:

1. **Next.js 15 on Vercel**, Frankfurt region. Edge functions for public surfaces, RSC for the workspace, serverless for app routes.
2. **Python FastAPI on Hetzner Nuremberg** (CCX53, 8 vCPU, 32 GB). Long-running uvicorn workers behind Cloudflare Tunnel; no public IP. Falkenstein warm-standby for HA (from Phase 23).

Web -> API traffic flows over Cloudflare Tunnel with mTLS + HMAC + nonce (ADR-0002). Database (Supabase EU-Frankfurt) and Object Storage (Hetzner Nuremberg) sit behind both.

## Alternatives considered

- **All on Vercel (with Edge Runtime for everything)**: edge runtime cannot run Tesseract, ClamAV, Ghostscript, or Anthropic Vision streaming reliably. Cold-start cost on long PDF jobs unacceptable.
- **All on Hetzner with Coolify/Plane self-hosted Next.js**: loses Vercel's edge network and DACH POP coverage; adds DC ops burden.
- **AWS (EKS or Lambda + ECS)**: higher operational complexity and cost; binds Strota to AWS data-processing-addendum chain on top of Anthropic.
- **Render or Fly.io**: smaller blast radius, but cost per GB-egress and Vision-Token-Heavy workload make Hetzner cheaper by a factor of 4-6x at expected scale.

## Consequences

Gains:
- Cost-efficient and predictable for AI-heavy workloads.
- EU data residency without complex AWS DPA chains.
- Next.js native experience on Vercel.

Costs:
- Two infra estates to operate.
- Inter-service auth must be designed carefully (ADR-0002).
- Egress between Vercel and Hetzner adds latency; mitigate with Cloudflare Tunnel in the same region.

## Related

- ADR-0002 inter-service auth.
- ADR-0007 Anthropic via Bedrock EU-Frankfurt (Phase 9, future).
- Bible v5.0 Part 3.1, 3.2.
