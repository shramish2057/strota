# DSFA v1 - Datenschutz-Folgenabschaetzung (Art. 35 DSGVO)

Living document. Erst-Filing Phase 2. v2-Update Phase 25 mit 6 Betriebsmonaten Real-Daten.

**Stand**: 2026-05-24 (v1.0)
**Verantwortlicher**: Strota (in Gruendung)
**Externe DSB-Beratung**: [Name folgt mit Phase-2-Engagement; Budget € 1.500-3.000]

## Warum DSFA-Pflicht

Art. 35 Abs. 1 DSGVO: "Hat eine Form der Verarbeitung, insbesondere bei Verwendung neuer Technologien, aufgrund der Art, des Umfangs, der Umstaende und der Zwecke der Verarbeitung voraussichtlich ein hohes Risiko fuer die Rechte und Freiheiten natuerlicher Personen zur Folge, so fuehrt der Verantwortliche vorab eine Abschaetzung der Folgen der vorgesehenen Verarbeitungsvorgaenge fuer den Schutz personenbezogener Daten durch."

Strota fuehrt eine DSFA durch fuer:
- **Automatisierte regulatorische Analyse von Bauantragsunterlagen** (Vollstaendigkeitspruefer + Baubeschreibungs-Generator + B-Plan-Analyzer): Verarbeitung von Bauherr-PII (Berufsgeheimnis-Klasse) mit KI-System mit potenzieller Auswirkung auf die Verfahrensart und damit Kosten/Aufwand fuer den Bauherrn.
- **Cited Q&A (Strota Fragt)**: KI-generierte Antworten mit Rechtsbezug; RDG-Beruehrung; siehe rdg-strategy.md.
- **Buerger-Chat Strota Kommune (Phase 30)**: B2C-Chatbot in oeffentlicher Verwaltung; potenzielle Auswirkung auf Verwaltungsakt.

Diese Verarbeitungen erfuellen auch den Listen-Tatbestand Liste 1 Nr. 11 und 12 der Anlage zur DSK-Liste der Verarbeitungsvorgaenge mit DSFA-Pflicht.

## Beschreibung der Verarbeitung

### V1 Vollstaendigkeitspruefer + Baubeschreibungs-Generator + B-Plan-Analyzer

- **Zweck**: Automatisierte Vollstaendigkeitspruefung und Texterzeugung von Bauantragsunterlagen
- **Datenkategorien**: Bauherr-Stammdaten, Eigentuemerdaten, Bauplaene (potenziell visuelle PII), Baubeschreibungen, B-Plaene
- **Betroffene**: Bauherren (natuerliche und juristische Personen), Eigentuemer, ggf. Nachbarn
- **Technologien**: Anthropic Claude (Bedrock EU-Frankfurt), Vision-API fuer B-Plaene
- **Empfaenger**: Architekt (Verantwortlicher), Strota (Auftragsverarbeiter), Anthropic+AWS (Sub-Auftragsverarbeiter)

### V2 Strota Fragt

- siehe ropa.md V3 und rdg-strategy.md

### V3 Buerger-Chat Kommune (Phase 30)

- siehe ropa.md V11

## Notwendigkeit + Verhaeltnismaessigkeit

| Pruef-Frage | Antwort | Begruendung |
|-------------|---------|-------------|
| Ist die Verarbeitung notwendig? | ja | Manuelle Pruefung kostet 5-15 Stunden/Antrag und ist fehleranfaellig; Architekt-Knappheit in DACH macht Automatisierung volkswirtschaftlich noetig |
| Verhaeltnismaessigkeit gegeben? | ja | Architekt-Override stets verfuegbar ("Trotzdem einreichen"); Pruefprotokoll dokumentiert jede automatisierte Pruefung; KI nie als finale Entscheidung (das Bauamt entscheidet) |
| Datenminimierung erfuellt? | ja | Nur Daten die fuer den Bauantrag noetig sind; Bauherr-Geburtsdatum nur wo statutarisch verlangt; Eigentuemer-Adresse strukturiert statt Freitext |
| Zweckbindung erfuellt? | ja | KI-Training-Ausschluss in AVV §6 + Anthropic-Bedrock-Vertrag; Daten werden nicht fuer andere Zwecke ausgewertet |

## Risiken fuer die Rechte und Freiheiten Betroffener

| Risiko | Eintrittswahrscheinlichkeit | Schwere | Score |
|--------|----------------------------|---------|-------|
| Falsche automatisierte Verfahrensart-Bestimmung -> falscher Bauantragsweg -> Bauherr-Kostenmehrbelastung | mittel (KI-Halluzination) | mittel (Korrektur kostet Wochen) | mittel |
| Unautorisierte Lesung von Bauherr-Daten durch Strota-Mitarbeiter | gering (RLS + Audit-Log + Vier-Augen) | hoch (Berufsgeheimnis-Bruch) | gering-mittel |
| Sub-Processor-Vorfall (Anthropic, AWS) | gering (etablierte Anbieter, EU-Region) | hoch | gering-mittel |
| KI-Training mit Kunden-Daten | sehr gering (AVV §6 vertraglich ausgeschlossen) | hoch (Berufsgeheimnis) | gering |
| Cross-Org-Lek durch RLS-Bug | gering (CI testet RLS-Isolation) | hoch | gering-mittel |
| Veroeffentlichung von Bauplaenen (oeffentlicher Bucket-Misconfiguration) | gering (Hetzner Object Storage Default-private) | hoch | gering-mittel |
| Bauherr-Daten in Sentry-Logs | gering (Allow-List PII-Redaction) | mittel | gering |
| qeS-Faelschung | sehr gering (D-Trust-Validation + TSA + OCSP) | sehr hoch | gering-mittel |
| Brand-Risiko bei Fehlausgabe Q&A (RDG) | mittel (KI-Halluzination im Recht) | mittel (Wettbewerbszentrale-Klage) | mittel |

## Massnahmen

| Risiko | Gegenmassnahme | Status |
|--------|---------------|--------|
| Verfahrensart-Bestimmung falsch | Architekt-Override + Pruefprotokoll + Domain-Expert-Validation-Gate Phase 4.5 + Phase 11; Vollstaendigkeitspruefer-Score nur advisory | implementiert (Phase 2 Schema) |
| Unautorisierte Lesung | RLS auf jeder Tabelle (db/migrations/002); Audit-Log mit Hash-Chain (003); Vier-Augen-Prinzip fuer Berufsgeheimnis-Klasse (data-classification.md); regelmaessige Access-Reviews | implementiert |
| Sub-Processor-Vorfall | 30-Tage-Aenderungsanzeige; Sub-Processor-Liste public; Cyber-Versicherung; Incident-Response-Plan | implementiert |
| KI-Training | AVV §6 + Anthropic-Bedrock-DPA-Addendum; Trainings-Ausschluss vertraglich | Phase 14 (AVV erst dann signiert) |
| Cross-Org-Lek | RLS-Isolation-CI-Smoke (Phase 2 db job) + Pen-Test Phase 25 + Bug-Bounty | implementiert (CI) + Roadmap |
| Bauplaene oeffentlich | Hetzner Object Storage private-by-default + signed URLs mit 24h-Gueltigkeit; CI-Lint gegen public-bucket-Misconfig | Phase 6 |
| PII in Logs | structlog mit Allow-List-Redaction; CI-Lint scannt Code auf log-Statements ohne Redaction | Phase 2 (logging.py) + Phase 9 |
| qeS-Faelschung | D-Trust + Bundesdruckerei + OCSP + TSA + PAdES-LTV; mehrstufige Verifikation | Phase 20 |
| RDG | RDG-Classifier vor Q&A-Synthese; Pflicht-Disclaimer; anwaltliches Gutachten Phase 2 als Hard-Gate | Phase 2 (Gutachten) + Phase 15.5 |

## Konsultation Betroffener

Bauherren sind die primaer Betroffenen. Direkte Konsultation ist im Kontext einer Verarbeitung durch ihren Architekten unueblich. Stattdessen:
- Bauherr-Information nach Art. 13 DSGVO im Bauherr-Guest-Link-Onboarding
- Schriftliches Beschwerde-Right via betroffenenrechte@strota.de
- Architektenkammern als Vertretung berufsstandes-naher Bauherren-Interessen konsultiert (Phase 4.5 Domain-Expert-Sessions)

## DSB-Konsultation

Externe DSB-Beratung wird in Phase 2 mit Budget € 1.500-3.000 beauftragt fuer Review dieses Dokuments. Identifikation des Anbieters folgt mit DPA-Abschluss. Bei verbleibendem hohem Risiko nach Massnahmen: Konsultation der Aufsichtsbehoerde nach Art. 36 DSGVO.

## Aufsichtsbehoerde

BayLDA (Bayerisches Landesamt fuer Datenschutzaufsicht) ist zustaendig fuer Strota (Sitz in Bayern; final mit GmbH-Gruendung Phase 14+).

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) - vor externer DSB-Review | Founder |
