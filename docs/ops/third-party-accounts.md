# Third-Party Accounts Checklist (Phase 1)

Every external service needs an account, a signed DPA / AVV where DSGVO applies, and credentials stored in Vault. Sub-Processor list published at strota.de/sub-processors.

## Phase 1 (must complete before any Phase 2 work)

| Service | Status owner | DPA / AVV | Region | Credentials in Vault |
|---------|--------------|-----------|--------|----------------------|
| Stripe (EU entity) | Founder | required (incl. SCC) | EU | stripe.secret_key, stripe.webhook_secret |
| Postmark | Founder | required (EU DPA) | EU | postmark.server_token |
| Anthropic | Founder | reviewed; KI-Training-Ausschluss bestätigt | EU via Bedrock | anthropic.api_key (fallback direct) |
| AWS (for Bedrock pass-through) | Founder | AWS DPA + SCC | eu-central-1 Frankfurt | aws.access_key_id, aws.secret_access_key |
| BKG Geocoder | Founder | terms-only (registration at gdz.bkg.bund.de) | DE (federal) | bkg.api_key |
| Hetzner | Founder | DPA signed | DE (NUE + FAL) + FI (HEL backup) | hetzner.cloud_token, hetzner.s3_keys |
| Cloudflare | Founder | DPA signed + SCC | global; EU termination | cloudflare.api_token, cloudflare.tunnel_token |
| Vercel | Founder | DPA signed | EU-Frankfurt | vercel.deploy_token |
| Sentry (self-hosted on Hetzner) | Eng-Lead | n/a (self-hosted) | DE | sentry.auth_token, sentry.dsn |
| PostHog (self-hosted on Hetzner) | Eng-Lead | n/a (self-hosted) | DE | posthog.api_key |
| Better Uptime | Founder | DPA signed | EU | betteruptime.api_key |
| GitHub | Founder | n/a (org-level) | global | gh.app_id, gh.private_key |
| Domain registrar (Domains: strota.de, .com, .at, .ch) | Founder | n/a | DE | n/a (UI only) |
| HashiCorp Vault (self-hosted Phase 1; HCP Phase 25 optional) | Eng-Lead | n/a self-hosted | DE | vault.root_token |

## Phase 2 additions (DSGVO baseline)

| Service | Status owner | Notes |
|---------|--------------|-------|
| e-recht24 template + Anwalt-Anpassung | Legal | EUR 1.000-1.500 |
| Consentmanager.net or Usercentrics | Founder | EUR 25-150/month |
| External DSB-Beratung (DSFA review) | Legal | EUR 1.500-3.000 |
| RDG-Gutachten anwaltlich | Legal | EUR 2.500-5.000 (Phase 15.5 hard gate) |
| Markenrecherche DPMA + EUIPO | Legal | EUR 500-1.500 |
| Berufshaftpflicht / Cyber-Versicherung | Founder | EUR 5 Mio min. coverage, EUR 500-1.500/month |

## Phase 20 additions

| Service | Status owner | Notes |
|---------|--------------|-------|
| D-Trust sign-me (qeS primary) | Eng-Lead | 4-8 weeks onboarding |
| Bundesdruckerei API (qeS secondary) | Eng-Lead | failover provider |

## Phase 25 additions

| Service | Status owner | Notes |
|---------|--------------|-------|
| Intigriti EU or YesWeHack EU (Bug Bounty) | Security | EUR 1.500 setup + variable rewards |
| Pentesting firm (TUEV-zertifiziert) | Security | EUR 5.000-8.000 |

## Onboarding workflow

1. Account created by Founder (verified email, MFA on).
2. DPA / AVV signed (PDF in `/legal/dpas/`).
3. Sub-processor entry added to strota.de/sub-processors (30-day notification process applies).
4. Credentials issued to Vault under predictable path.
5. ROPA entry updated.
6. Phase deliverables include "third-party account live" only after all five above are done.
