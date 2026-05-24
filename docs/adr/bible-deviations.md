# Bible deviations

`strota_product_bible.md` (internal, gitignored) is the founding document. The implementation diverges from it on purpose in a handful of places. This file is the running record so the deviations stay deliberate, not accidental.

| Bible section | Bible says | We do | Recorded in |
|---------------|-----------|-------|-------------|
| Part 3.2 Stack | Supabase EU-Frankfurt (Postgres + Auth + Realtime + Storage + Studio + PITR) | Self-hosted Postgres 17 on the Hetzner CCX53; custom auth in FastAPI; Hetzner Object Storage for files; SSE from FastAPI for Realtime (Phase 6+); pgAdmin/psql for Studio | ADR-0006 |
| Part 3.1 Hetzner sizing | CCX53 + warm-standby in Falkenstein from Phase 23 | CCX53 in Nuremberg hosts FastAPI + Postgres + Redis on one node through Phase 15; Falkenstein warm-standby still added in Phase 23 | ADR-0001 (revised 2026-05-24) |
| Part 6 Budget | "Supabase Pro + read-replica + PITR ~€100-400/mo" | €0/mo (self-hosted on the CCX53). Object Storage backup costs unchanged. | (this file) |
| Appendix C Sub-Processors | Supabase as sub-processor for DB/Auth/Realtime/Storage | Supabase removed entirely. Sub-processor list: Hetzner, Cloudflare, Vercel, AWS Bedrock + Anthropic, Stripe, Postmark, BKG, D-Trust, A-Trust, SwissSign, Better Uptime, Consentmanager.net, Intigriti, PagerDuty | (Phase 2 ROPA + AVV Annex 1) |

Keep this list short. Bible-vs-reality drift becomes painful past 5-6 entries; if the list grows, bump the bible.
