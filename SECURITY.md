# Security Policy

Strota verarbeitet vertrauliche Bauherrendaten und berufsrechtlich geschützte Architektendaten. Sicherheit ist Kern-Anforderung, nicht Add-on.

## Reporting a Vulnerability

Bitte sicherheitsrelevante Findings vertraulich melden an `security@strota.de` (Email aktiv ab Phase 2).

PGP-Key: wird mit Phase 2 (DSGVO-Baseline) veröffentlicht.

Reaktionszeit:
- Erstantwort innerhalb 48 Stunden (Werktag).
- Triage-Klassifizierung innerhalb 5 Werktagen.
- Kritische Findings: koordinierter Patch + Disclosure.

## Bug-Bounty

Phase 25+: öffentliches Programm via Intigriti EU. Bis dahin: Responsible Disclosure mit Hall-of-Fame.

## Scope

Im Scope:
- Production-Surfaces (strota.de, app.strota.de, api.strota.de).
- Auth-Flows, Inter-Service-Auth.
- File-Upload-Pipeline.
- qeS-Signatur-Pipeline.
- Bauträger-REST-API.

Out of Scope:
- Social Engineering.
- Physical Attacks.
- DoS / DDoS (Cloudflare WAF handhabt das).
- Third-Party-Services (siehe Sub-Processor-Liste).

## Coordinated Disclosure

Strota committet sich auf 90-Tage-Disclosure-Window nach Patch-Verfügbarkeit. Verlängerung in Abstimmung mit Reporter möglich.
