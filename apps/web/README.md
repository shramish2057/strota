# @strota/web

Next.js 15 App Router auf Vercel (EU-Frankfurt region). User-facing Surface aller öffentlichen Tools und der authentifizierten Workspace.

## Stack

- Next.js 15 (App Router, React 19 RC).
- TypeScript strict (siehe `tsconfig.json` extending root `tsconfig.base.json`).
- Tailwind CSS 3.4 mit Strota Design Tokens (Part 2.2 v5.0 Bible).
- Vitest für Unit-Tests.
- Edge Runtime für `/healthz` und Genehmigungsfrei-Prüfer.

## Lokal starten

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm --filter @strota/web dev
```

Dev-Server: http://localhost:3000

Healthcheck: http://localhost:3000/healthz

## Tests

```bash
pnpm --filter @strota/web test
pnpm --filter @strota/web typecheck
pnpm --filter @strota/web lint
```

## Phase-1-Scope

- App-Shell mit Strota-Design-Tokens (light + dark mode via `[data-theme="dark"]`).
- `/healthz` Edge-Runtime-Endpoint.
- Skip-Link für Accessibility (WCAG 2.2 AA Baseline).
- Reduced-Motion-Respect.
- Security-Headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).

Spätere Phasen ergänzen Public-Surfaces (Phase 3.5), Auth (Phase 2), Workspace (Phase 5+), etc.
