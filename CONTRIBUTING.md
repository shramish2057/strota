# Contributing

Strota ist ein proprietäres Projekt im Aufbau. Externe Beiträge sind aktuell nur auf Einladung möglich.

## Internes Team

### Setup

```bash
nvm use
corepack enable && corepack prepare pnpm@9 --activate
pnpm install
cp .env.example .env
```

### Workflow

1. Branch von `main`: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
2. Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
3. PR mit beschreibendem Titel + Test-Plan.
4. CI muss grün sein vor Merge.
5. Mindestens 1 Reviewer pro PR.

### Code-Standards

- TypeScript strict (siehe `tsconfig.base.json`).
- Python: ruff + mypy strict.
- Prettier + ESLint für JS/TS, ruff format für Python.
- Tests: Vitest (Node) + pytest (Python) + Playwright (E2E).
- Keine Geviertstriche (U+2014) und keine doppelten Bindestriche als Satzzeichen in Code oder Dokumentation. Stattdessen: einfacher Bindestrich, Komma, Doppelpunkt oder Punkt. CI prüft das automatisch (siehe `.github/workflows/ci.yml` Job `punctuation-guard`).

### Korpus-Beiträge

Korpus-Änderungen (LBO, BauVorlV, B-Pläne, Satzungen) folgen einem eigenen Review-Prozess. Siehe `packages/corpus/CONTRIBUTING.md` (ab Phase 4).

### Sicherheits-relevante Änderungen

Änderungen an Auth, Inter-Service-Auth, Crypto, Schema/RLS, qeS-Pipeline: erfordern zusätzlich Review durch Security-Owner und müssen ADR-dokumentiert sein.

### ADR-Prozess

Architekturentscheidungen werden in `docs/adr/NNNN-slug.md` festgehalten. Format siehe `docs/adr/0001-architecture-decision.md`. Neue ADR: nächste freie Nummer.

### Commits

Lokale Commit-Hooks (Husky + lint-staged) werden ab Phase 3 aktiviert.
