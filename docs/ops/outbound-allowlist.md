# Hetzner Outbound Allowlist

Default deny on Hetzner `strota-api` (CCX53). Egress only to the destinations below. Anything else aborts startup at the firewall level.

## Phase 1 allowlist

| Destination | Purpose | Protocol |
|-------------|---------|----------|
| `*.anthropic.com` | Claude API direct (fallback path) | HTTPS 443 |
| `bedrock-runtime.eu-central-1.amazonaws.com` | Anthropic via AWS Bedrock EU-Frankfurt | HTTPS 443 |
| `api.stripe.com` | Stripe payments | HTTPS 443 |
| `api.postmarkapp.com` | Postmark transactional email | HTTPS 443 |
| `sgx.geodatenzentrum.de`, `gdz.bkg.bund.de` | BKG Geocoder (AGS resolution) | HTTPS 443 |
| `database.clamav.net`, `current.cvd.clamav.net` | ClamAV signature updates (freshclam) | HTTPS 443 |
| `*.hetzner.cloud`, `*.your-objectstorage.com` | Hetzner Object Storage + Cloud API | HTTPS 443 |
| `*.supabase.co`, `*.supabase.com` | Supabase (DB, Auth, Realtime, Storage) | HTTPS 443 |
| `*.cloudflare.com` | Tunnel control plane | HTTPS 443 |
| `pool.ntp.org`, `time.cloudflare.com` | NTP (skew control critical for HMAC) | NTP 123 |

Add a row before adding a new outbound destination. Reviewed quarterly.

## How to apply

Hetzner firewall rules live in `infra/hetzner/firewall.tf` (Terraform, added Phase 23). Until then: manual ruleset via Hetzner Cloud Console. Document changes in the on-call channel and update this file.

## Alerting

Better Uptime watches `https://api.dev.strota.internal/healthz`. Cloudflare WAF logs egress denials; weekly review in the on-call channel.
