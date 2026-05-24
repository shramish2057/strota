# ADR-0020: Bauherr is the data subject; Architekt is the Verantwortlicher

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Founder / Legal

## Context

Strota processes lots of Bauherr-PII. We need a clear DSGVO actor-mapping or we will fight every Betroffenenrechts-Anfrage and AVV-Verhandlung.

Three configurations are theoretically possible:

1. Strota = Verantwortlicher for the Bauherr-PII (we decide purposes + means).
2. Strota = Auftragsverarbeiter; Architekturbuero = Verantwortlicher (the architect decides on the purpose of the Bauantrag and instructs Strota).
3. Joint controllership Strota + Architekt under Art. 26 DSGVO.

## Decision

**Architect's organization is the Verantwortlicher; Strota is the Auftragsverarbeiter.** Art. 28 DSGVO governs the relationship.

Rationale: The architect's office decides which Bauherr it serves, which Bauantrag it files, when, how, and with what content. Strota is a tool. The architect instructs (via UI clicks); Strota executes. This matches the actual decision-flow and gives a clean AVV story.

The Bauherr is the **betroffene Person** (data subject) for all his/her PII. The Architekt is the Verantwortlicher gegenueber the Bauherr. Strota fulfils Art. 13 information to the Bauherr in the Architekt's name via the Bauherr-Guest-Link-Onboarding-Flow (Phase 19 UI).

## Alternatives considered

- **Joint controllership**: would require an Art. 26 agreement with every architect office. High overhead, weakens both parties' clarity on responsibilities, and doesn't reflect the actual decision-flow.
- **Strota = Verantwortlicher**: lets us avoid AVV signings but exposes us directly to every Betroffenenrechts-Anfrage and forces us to handle Bauherr-Konsultation directly. Misaligned with reality - we don't decide who the Bauherrn are.

## Consequences

Gains:
- AVV template clear and signable at first paid contract.
- DSR-Anfragen for Bauherr-Daten go to the Architekt; Strota merely executes per AVV §9.
- Liability allocation matches Art. 82 DSGVO.

Costs:
- Customer-facing AVV must exist (now does; `docs/legal/avv-template-de.md`).
- Architects must understand they are Verantwortliche; we onboard with a one-page DSGVO-Brief.
- Bauherr information flow (Art. 13) must be implementable inside Strota's UI on behalf of the Architekt.

## Related

- `docs/legal/avv-template-de.md` § 5.
- `docs/compliance/ropa.md` V1.
- `docs/compliance/dsr-workflow.md` 'Wer ist Verantwortlicher fuer welche Daten?'.
- Bible v5.0 Part 0.6 + Part 10.
