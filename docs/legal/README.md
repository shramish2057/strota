# Legal

Vertragsvorlagen, Anwaltskorrespondenz, UWG-Belege, Markenrecherche.

## Index

- [AVV-Vorlage DE (Art. 28 DSGVO)](avv-template-de.md) - Customer-facing; signed at first paid contract; public unter `strota.de/avv`.
- [RDG-Gutachten Anwaltsbrief](rdg-gutachten-brief.md) - Phase 2 Auftrag an Anwalt; Antwort kommt unter `/legal/rdg-gutachten-YYYY-vN.md` (gitignored fuer Vertraulichkeit).
- [UWG-Belege](uwg-belege/README.md) - Belegarchiv fuer jeden Werbe-Claim.
- [Markenrecherche](markenrecherche.md) - DPMA + EUIPO Recherche-Tracker.

## Public-Mirror

- `strota.de/avv` rendert die AVV-Vorlage
- `strota.de/impressum`, `strota.de/datenschutz`, `strota.de/cookies` leben in apps/web

## Vertraulichkeit

Folgende Artefakte sind **gitignored** (private repos / Vault):

- Signed AVVs mit Kunden
- Anwaltliche Gutachten (RDG, Marken, etc.)
- Sub-Processor-DPAs
- Cyber-Versicherungsschein
- Anwaltskorrespondenz
- Bauherr-NDAs

Diese werden im Strota-Internal-Repository unter dem Namens-Schema `/legal/private/...` gepflegt.

## Update-Cadence

| Document | Owner | Review |
|----------|-------|--------|
| AVV | Legal | jaehrlich |
| RDG-Gutachten | Legal | nach RDG-Novelle oder Wettbewerbsstreit |
| UWG-Belege | Marketing | mit jedem neuen Claim |
| Markenrecherche | Founder | vor Public-Launch + jaehrlich |
