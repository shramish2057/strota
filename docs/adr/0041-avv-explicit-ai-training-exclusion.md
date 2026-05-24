# ADR-0041: AVV § 6 - explicit KI-Trainings-Ausschluss, passed through to sub-processors

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Founder / Legal

## Context

Bauherrendaten are Berufsgeheimnis-Klasse (see `docs/compliance/data-classification.md`). Architekturbueros need a hard contractual guarantee that their Mandanten-Daten will NEVER feed into any KI-Modell-Training, not by Strota and not by any Sub-Auftragsverarbeiter.

Anthropic's standard commercial terms include a no-training-for-Sonnet/Opus opt-out on the Bedrock pathway. We pass that contract through to our customers.

## Decision

AVV § 6 (Pflichten des Auftragsverarbeiters) explicitly states:

> "Expliziter KI-Trainings-Ausschluss: Strota verwendet die personenbezogenen Daten des Verantwortlichen NIEMALS fuer das Training, Re-Training oder Fine-Tuning von KI-Modellen, weder eigener noch von Sub-Processor (insbesondere Anthropic, AWS Bedrock). Diese Zusicherung ist in den jeweiligen Sub-Processor-Vertraegen durchgereicht."

We mirror this in:

- `docs/legal/avv-template-de.md` § 6
- `apps/web/src/app/avv/page.tsx` (public page; under "Wesentliche Zusicherungen")
- `apps/web/src/app/datenschutz/page.tsx` § 9 (Automatisierte Entscheidungsfindung)
- `docs/compliance/data-classification.md` (Berufsgeheimnis-Klasse Handling-Pflichten)
- `docs/compliance/ropa.md` V2 (AI-Verarbeitung)

## Alternatives considered

- **Implicit via "wir verarbeiten nach Weisung"**: too weak; customers want it in black and white because the question gets asked every time.
- **Make it a marketing-page promise but not contractual**: opens us to UWG § 5 claims if a sub-processor later changes its terms.
- **Restrict to enterprise-tier**: contradicts the trust-equality principle; small Architekturbueros need the same protection as large Bautraeger.

## Consequences

Gains:
- Customer trust during onboarding; this is one of the most-asked questions.
- Clear basis for terminating sub-processor relationships that change their training stance.
- Aligns with Bauherr's expectation of Berufsgeheimnis-Schutz.

Costs:
- We must monitor Anthropic + AWS terms changes (Phase 7 R16 risk register: "Sub-processor AVV changes adversely").
- Customer-facing AVV signature gate on first paid contract; technical work in Phase 14 billing flow to enforce.

## Related

- `docs/legal/avv-template-de.md` § 6.
- `apps/web/src/app/avv/page.tsx`, `/datenschutz`, `/sub-processors`.
- `docs/compliance/ropa.md` V2.
- Bible v5.0 Part 10.
