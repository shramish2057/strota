# ADR-0017: DSFA in Phase 2, not Phase 25

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Founder / Legal

## Context

Earlier drafts of the bible placed the Datenschutz-Folgenabschaetzung (Art. 35 DSGVO) in Phase 25 (DSGVO Enterprise Hardening). On second senior audit this was wrong: Art. 35 demands the DSFA **before** the high-risk processing begins. Our automated regulatory analysis on Berufsgeheimnis-class data (Bauherr-PII inside Bauantrag workflows) is high-risk processing the moment it touches a real Bauherrn.

## Decision

DSFA v1 is a Phase 2 deliverable. External DSB-Beratung reviews it (€ 1.500-3.000 budget). It covers:

- Vollstaendigkeitspruefer + Baubeschreibungs-Generator + B-Plan-Analyzer (V1 from ROPA)
- Strota Fragt (V3)
- Buerger-Chat Strota Kommune (V11, Phase 30 anticipated)

DSFA v2 in Phase 25 updates with 6 months of real-data observations.

## Alternatives considered

- **DSFA only in Phase 25**: legally late. If Phase 4.5 architect-validation already touches real Bauherrn-Daten, we owe a DSFA before that point.
- **Skip DSFA, rely on legitimate-interest balancing**: Art. 35 mandates DSFA when the processing is likely to result in a high risk; relying on a balancing test where the law expects a DSFA invites Aufsichtsbehoerde-Sanktion.

## Consequences

Gains:
- We satisfy the prior-DSFA obligation before any real Bauherrn-PII touches the system.
- We engage DSB-Beratung early, so Phase 4.5 sessions can use the DSB's input.

Costs:
- Phase 2 budget grows by € 1.500-3.000 (DSB-Beratung) and pulls forward a calendar week or two.

## Related

- ADR-0006 self-hosted Postgres + custom auth.
- `docs/compliance/dsfa-v1.md`.
- Bible v5.0 Part 3.7c.
