# ADR-0021: RDG strategy - abstract-only Q&A + classifier + § 6 fallback + Pflicht-Disclaimer

- Status: accepted
- Date: 2026-05-24
- Phase: 2 (Gutachten) / 15.5 (Live)
- Owner: Founder / Legal

## Context

§ 2 Abs. 1 RDG: "Rechtsdienstleistung ist jede Taetigkeit in konkreten fremden Angelegenheiten, sobald sie eine rechtliche Pruefung des Einzelfalls erfordert."

Strota Fragt + Vollstaendigkeitspruefer + Verfahrensbestimmung touch this definition. We need a defensible legal posture **before** Phase 15.5 (Strota Fragt live) or Wettbewerbszentrale and the Verein gegen unlauteren Wettbewerb will be the ones who classify our offering for us.

## Decision

Six pillars (full reasoning in `docs/compliance/rdg-strategy.md`):

1. **Abstract Norm-Auskunft only** in Strota Fragt; LLM classifier rejects concrete Einzelfall queries.
2. **Tool-Empfehlung framing** in every output: we provide texts and data, not subsumption.
3. **Pflicht-Disclaimer** on every output: "Strota ist kein Rechtsdienstleister iSd § 10 RDG."
4. **Adressatenkreis restricted to berufsmaessige Bauantragsteller** (Architekten, Bauingenieure mit BVB, Stadtplaner mit BVB, Innenarchitekten innerhalb Innenausbau-Scope). Unlimited free Q&A only for Kammer-validated architects.
5. **§ 6 RDG fallback** (unentgeltliche Rechtsdienstleistung ausserhalb persoenlicher Beziehungen).
6. **§ 5 RDG Nebenleistung fallback** for the Vollstaendigkeitspruefer (norm-bezug ist Nebenleistung zur Tool-Hauptleistung).

**Phase 15.5 is hard-gated on an anwaltliches RDG-Gutachten** (Phase 2 deliverable; budget € 2.500-5.000). Without the gutachten Strota Fragt is not rolled out.

A **mode switch** (full / read-only / shutdown) lets us shut Strota Fragt down within an hour if the legal posture flips.

## Alternatives considered

- **Register Strota as a Rechtsdienstleister under § 10 RDG**: enormous overhead, requires anwaltliche Aufsicht, makes the SaaS model unworkable.
- **Restrict to closed-beta with NDAs**: drops the public surface that the bible identifies as the top-of-funnel.
- **Skip RDG analysis, hope no one notices**: the Wettbewerbszentrale routinely targets young SaaS in regulated verticals. Not a strategy.

## Consequences

Gains:
- Strota Fragt can ship with a legal foundation.
- Mode-switch limits blast radius if a BGH precedent or RDG novella flips the situation.

Costs:
- € 2.500-5.000 Anwalt-Budget Phase 2.
- LLM-Classifier (Haiku, low cost) on every Q&A query.
- Pflicht-Disclaimer on every output (UX friction; we use sticky-but-quiet placement).
- Phase 15.5 launch tied to Gutachten timeline.

## Related

- `docs/compliance/rdg-strategy.md`.
- `docs/legal/rdg-gutachten-brief.md` (the formal request).
- ADR-0024 Eigentuemer-Modell, which interacts with RDG (Bevollmaechtigten-Fragen).
- Bible v5.0 Part 0.6.4, S3 Strota Fragt.
