# ADR-0024: Eigentuemer != Bauherr data model

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Founder / Domain-Lead

## Context

Earlier drafts of the bible conflated Bauherr and Eigentuemer. Real-world Bauantraege regularly involve constellations where they differ:

- Mieter as Bauherr - needs Eigentuemer-Zustimmungserklaerung.
- WEG-Sondereigentuemer as Bauherr for changes that affect Gemeinschaftseigentum - needs WEG-Beschluss.
- Erbengemeinschaft as Bauherr - all Miterben must consent.
- Erbbauberechtigter as Bauherr - separate from grundbuchrechtlichem Eigentuemer.
- Juristische Person als Bauherr mit anderen Eigentuemer-Strukturen.

These constellations change which documents the Bauamt expects. Modeling them properly in schema beats hacking them in via free-text Vollmacht-Felder.

## Decision

Three persona tables in the schema:

- `bauherren` (project_id n:1, multiple Bauherren per project allowed for Bauherrengemeinschaft etc.)
- `eigentuemer` (project-scoped via projekt_eigentuemer n:m)
- `weg_beschluesse` (project-scoped, for WEG cases)

`bauherren.person_type` enum covers all real constellations: natuerlich, juristisch, gbr, ehepaar, bauherrengemeinschaft, erbengemeinschaft, weg_sondereigentuemer, erbbauberechtigt, sonstige_juristisch.

`bauherren.eigentuemer_ist_bauherr` boolean flag: if false, projekt_eigentuemer must be populated. UI gates Module 0 wizard step "Bauherr & Eigentum" before Verfahrensbestimmung.

Schema details: `db/migrations/001_initial_schema.sql` lines 130-200.

## Alternatives considered

- **Single `bauherren` table with free-text fields for Vollmacht and Eigentuemer**: loses queryability; cannot drive document-requirements logic; Module 0 cannot reason about Eigentuemer-Konstellation.
- **One persona table with type=enum**: too narrow; WEG-Beschluesse have their own lifecycle and history that needs their own table.

## Consequences

Gains:
- Module 0 (Verfahrensbestimmung) can branch on Eigentumssituation and produce the correct document list.
- Module 6 (Letter Generator) can produce Eigentuemererklaerung / WEG-Beschluss / Vollmachts-Vorlagen with the right pre-fill.
- DSGVO Art. 13 information per persona-Typ correctly addressed (Bauherr vs. Eigentuemer have different roles).
- Schema is honest about real-world complexity instead of papering over it.

Costs:
- More tables to maintain.
- RLS policies for each persona table (we did this in `002_rls_policies.sql`).
- UI wizard has an extra step.

## Related

- `db/migrations/001_initial_schema.sql` (bauherren, eigentuemer, weg_beschluesse, projekt_eigentuemer).
- `db/migrations/002_rls_policies.sql` (persona-table policies).
- Bible v5.0 Part 0.6.1a (Eigentuemer != Bauherr Case Matrix).
