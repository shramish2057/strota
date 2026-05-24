# Strota

Bauantragsplattform für DACH. AI-native Vorbereitung, Vollständigkeitsprüfung und Submission von Bauantragsunterlagen.

> Bauanträge. Schneller. Vollständig. Eingereicht.

## Status

Phase 1: Foundation in Arbeit. Siehe `docs/adr/` für Architektur-Entscheidungen.

## Monorepo

```
strota/
  apps/
    web/            Next.js 15 App Router (Vercel, EU-Frankfurt)
    api-python/     FastAPI (Hetzner Nuremberg, Cloudflare Tunnel)
  packages/
    shared/         TypeScript types, HMAC, contracts
    corpus/         Regulatorischer Korpus (LBO, BauVorlV, B-Pläne)
    ui/             shared shadcn-basierte UI-Components
  docs/
    adr/            Architecture Decision Records
    ops/            Runbooks, Outbound-Allowlist, Onboarding
    compliance/     DSGVO ROPA, TOMs, Incident Response (private)
```

## Voraussetzungen

- Node.js >= 20.11 (`nvm use`)
- pnpm >= 9.0 (`corepack enable && corepack prepare pnpm@9 --activate`)
- Python >= 3.12 + uv (`pipx install uv`)
- Docker (für lokales ClamAV, Ghostscript, VeraPDF)

## Lokale Entwicklung

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Tests

```bash
pnpm test
pnpm typecheck
pnpm lint
```

## CI

GitHub Actions: lint, typecheck, test, build auf jedem PR. Siehe `.github/workflows/ci.yml`.

## Lizenz

Proprietär. Alle Rechte vorbehalten Strota (in Gründung).

## Kontakt

Strota Gründungsteam: hallo@strota.de (Email aktiv ab Phase 2).
