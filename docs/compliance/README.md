# Compliance

DSGVO + berufsrechtliche Compliance-Artefakte. Pflicht-Dokumente nach v5.0 Bible Part 3.7a-d.

## Index

- [ROPA - Verzeichnis der Verarbeitungstaetigkeiten (Art. 30 DSGVO)](ropa.md)
- [TOMs - Technische und organisatorische Massnahmen (Art. 32 DSGVO)](toms.md)
- [Incident Response Plan (Art. 33/34 DSGVO)](incident-response.md)
- [Data Subject Rights Workflow (Art. 15-21 DSGVO)](dsr-workflow.md)
- [Datenklassifizierung](data-classification.md)
- [DSFA v1 - Datenschutz-Folgenabschaetzung (Art. 35 DSGVO)](dsfa-v1.md)
- [RDG-Compliance-Strategie](rdg-strategy.md) (links to /docs/legal/rdg-gutachten-brief.md)

Public excerpts are mirrored on the website:
  - `strota.de/datenschutz` (Datenschutzerklaerung; anwaltlich erstellt; lebt in apps/web)
  - `strota.de/impressum`
  - `strota.de/toms` (Auszuege aus TOMs)
  - `strota.de/avv` (AVV-Vorlage)
  - `strota.de/sub-processors` (Unterauftragsverarbeiter-Liste)
  - `strota.de/cookies` (Cookie-Erklaerung)

## Update-Cadence

| Document | Owner | Review | Trigger |
|----------|-------|--------|---------|
| ROPA | Founder/DSB | jaehrlich | neue Verarbeitungstaetigkeit, neuer Sub-Processor |
| TOMs | Eng-Lead | jaehrlich | neue Sicherheitsmassnahme, Pen-Test-Findings |
| IRP | Eng-Lead/Legal | jaehrlich + nach jedem Incident | DSGVO-Aenderung, neuer Sub-Processor |
| DSR-Workflow | Customer Success | bei Aenderung der Self-Service-UI | neuer Datentyp im Export |
| Data Classification | Eng-Lead | jaehrlich | neue Datenkategorie |
| DSFA | Founder + externe DSB-Beratung | alle 6 Monate (v1, v2 nach 6 Betriebsmonaten) | hochrisikoreiche Verarbeitung neu |
| RDG-Gutachten | Founder + Anwalt | nach RDG-Novelle, nach Wettbewerbszentrale-Hinweis | Phase-15.5-Hard-Gate |
