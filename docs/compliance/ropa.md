# ROPA - Verzeichnis der Verarbeitungstaetigkeiten (Art. 30 DSGVO)

Living document. Jaehrliche Pflicht-Review. Auf Anfrage der Aufsichtsbehoerde vorzulegen.

**Stand**: 2026-05-24
**Verantwortlicher**: Strota (in Gruendung), vertreten durch den Founder
**Datenschutzbeauftragter**: extern, DSB-Beratung [Name folgt mit DPA-Abschluss in Phase 2]
**Kontakt**: datenschutz@strota.de (E-Mail aktiv ab Phase 2)

## Format

Pro Verarbeitungstaetigkeit:

```
Nr | Bezeichnung
   Zweck:
   Rechtsgrundlage (Art. 6 DSGVO):
   Datenkategorien:
   Betroffene Personen:
   Empfaenger / Sub-Processor:
   Drittland-Uebermittlung:
   Aufbewahrung / Loeschung:
   TOM-Referenz:
```

---

## V1 - Bauantragsverwaltung (Kern-Workflow)

- **Zweck**: Vorbereitung, Vollstaendigkeitspruefung und Einreichung von Bauantragsunterlagen
- **Rechtsgrundlage**: Art. 6(1)(b) DSGVO (Vertragserfuellung mit der Architekturkanzlei)
- **Datenkategorien**: Bauherr-Stammdaten (Name, Adresse, ggf. Geburtsdatum, Eigentumsdaten), Eigentuemerdaten (wenn != Bauherr), Projekt-Adressdaten, Bauplaene, Lageplaene, Baubeschreibungen
- **Betroffene**: Bauherren (natuerliche und juristische Personen, Bauherrengemeinschaften, Erbengemeinschaften, WEG), Eigentuemer, Fachplaner, Bauleiter
- **Empfaenger**: Bauamt / Bauaufsichtsbehoerde via Architekt (Auftraggeber); ggf. Nachbarn bei freiwilliger Beteiligung
- **Sub-Processor**: Hetzner Online GmbH (DE - Compute + Storage), Anthropic via AWS Bedrock (EU-Frankfurt - AI-Verarbeitung), Cloudflare (global mit EU-Terminierung - DDoS/WAF/Tunnel), Vercel (EU-Frankfurt - Web-Hosting)
- **Drittland**: nein (alle Sub-Processor mit EU-Datenresidenz oder SCC)
- **Aufbewahrung**: 10 Jahre (HOAI § 14 + AO § 147 + HGB § 257). Soft-Delete + 10-Jahres-Lifecycle (db/migrations/003_triggers_lifecycle.sql)
- **TOM-Referenz**: TOM-1 bis TOM-8

## V2 - AI-Verarbeitung (Vollstaendigkeitspruefer + Baubeschreibungs-Generator)

- **Zweck**: Automatisierte Texterzeugung und Vollstaendigkeitspruefung von Bauantragsunterlagen
- **Rechtsgrundlage**: Art. 6(1)(b) DSGVO + Art. 22(2)(c) DSGVO (ausdrueckliche Einwilligung des Verantwortlichen vor erster automatisierter Pruefung)
- **Datenkategorien**: Projekt-Stammdaten, Bauantragsunterlagen-Inhalte (Plaene, Beschreibungen)
- **Betroffene**: Bauherren, Architekten, Fachplaner
- **Sub-Processor**: Anthropic via AWS Bedrock (EU-Frankfurt). KI-Training-Ausschluss in AVV §6 explizit (auch durchgereicht in Anthropic-Bedrock-DPA)
- **Drittland**: nein (Bedrock EU-Frankfurt)
- **Aufbewahrung**: Cache 24 h pro Frage-Hash; Output-Texte fallen unter V1
- **TOM-Referenz**: TOM-2, TOM-3, TOM-5

## V3 - Q&A Strota Fragt (abstrakte Baurecht-Fragen)

- **Zweck**: Beantwortung abstrakter regulatorischer Fragen mit Norm-Zitation
- **Rechtsgrundlage**: Art. 6(1)(f) DSGVO (berechtigtes Interesse: Bereitstellung des bezahlten Dienstes)
- **Datenkategorien**: Frage-Text (anonymisiert, kein PII-Bezug erlaubt - RDG-Classifier blockiert konkrete Sachverhalte; siehe rdg-strategy.md)
- **Betroffene**: Architekten (Kammer-validierte fuer Unlimited)
- **Sub-Processor**: Anthropic via AWS Bedrock
- **Aufbewahrung**: Cache 24 h, Logs 30 Tage
- **TOM-Referenz**: TOM-2, TOM-3, TOM-8

## V4 - Genehmigungsfrei-Pruefer (anonymes Public-Tool)

- **Zweck**: Public-Surface "Brauche ich einen Bauantrag?"
- **Rechtsgrundlage**: Art. 6(1)(f) DSGVO (berechtigtes Interesse: Lead-Funnel)
- **Datenkategorien**: IP-Hash (SHA-256 + taeglich rotierender Salt; pseudonym iSd Erw.-Grund 26), Bundesland, Projekttyp-Eingaben
- **Betroffene**: anonyme Nutzer
- **Sub-Processor**: keine (rein deterministisch aus Korpus)
- **Aufbewahrung**: 30 Tage als aggregierte Statistik; nach Salt-Rotation nicht mehr deanonymisierbar
- **TOM-Referenz**: TOM-3, TOM-8

## V5 - Billing

- **Zweck**: Vertragsabrechnung, Rechnungsstellung, SEPA-Lastschrift
- **Rechtsgrundlage**: Art. 6(1)(b) DSGVO + Art. 6(1)(c) DSGVO (§14 UStG, AO §147, HGB §257)
- **Datenkategorien**: Org-Stammdaten, Rechnungsadresse, USt-IdNr., SEPA-Mandat, Zahlungsdaten
- **Betroffene**: Org-Owner / Org-Admin
- **Sub-Processor**: Stripe Payments Europe Ltd. (EU-Entity, signed DPA + SCC)
- **Aufbewahrung**: 10 Jahre (HGB §257, AO §147)
- **TOM-Referenz**: TOM-1, TOM-5, TOM-7

## V6 - Audit-Log

- **Zweck**: Sicherheit, Beweissicherung, regulatorische Nachweisbarkeit
- **Rechtsgrundlage**: Art. 6(1)(c) DSGVO + Art. 6(1)(f) DSGVO
- **Datenkategorien**: User-ID, Org-ID, Aktion, Entity-Referenz, Metadata, Hash-Chain
- **Betroffene**: Users + indirekt Bauherren via Aktion-Metadata
- **Empfaenger**: nur intern (Org-Admin im Read-Modus, SRE via service role)
- **Aufbewahrung**: 10 Jahre hot + Cold-Archive danach (audit_log_no_delete RULE, db/migrations/001_initial_schema.sql)
- **TOM-Referenz**: TOM-2, TOM-4, TOM-7

## V7 - Sicherheits-Logs (Sentry self-hosted)

- **Zweck**: Fehlerdiagnose, Sicherheits-Monitoring
- **Rechtsgrundlage**: Art. 6(1)(f) DSGVO
- **Datenkategorien**: Stacktrace, redacted PII (Allow-List-Pattern)
- **Sub-Processor**: keine (Sentry self-hosted auf Hetzner; nicht als Sub-Processor)
- **Aufbewahrung**: 90 Tage
- **TOM-Referenz**: TOM-3, TOM-5

## V8 - Produkt-Analytics (PostHog self-hosted, consent-gated)

- **Zweck**: UX-Verbesserung, Funnel-Analyse
- **Rechtsgrundlage**: Art. 6(1)(a) DSGVO (Einwilligung via Cookie-Banner)
- **Datenkategorien**: Klick-Pfade, Funnel-Events (pseudonymisiert)
- **Sub-Processor**: keine (PostHog self-hosted)
- **Aufbewahrung**: 12 Monate
- **TOM-Referenz**: TOM-3

## V9 - Marketing-Newsletter

- **Zweck**: Produkt-Updates, Phasen-Releases
- **Rechtsgrundlage**: Art. 6(1)(a) DSGVO (Opt-In mit Double-Confirm)
- **Datenkategorien**: E-Mail-Adresse
- **Sub-Processor**: Postmark (EU)
- **Aufbewahrung**: bis Abmeldung; Abmelde-Belegfrist 3 Jahre
- **TOM-Referenz**: TOM-1, TOM-5

## V10 - Auth / Session-Management

- **Zweck**: Anmeldung, Session-Verwaltung, Passwort-Reset
- **Rechtsgrundlage**: Art. 6(1)(b) DSGVO
- **Datenkategorien**: E-Mail, Passwort-Hash (argon2id), Session-Token-Hashes, IP-Hash, User-Agent, Last-Login-Timestamp
- **Sub-Processor**: Postmark (EU - Versand der Auth-Mails)
- **Aufbewahrung**: Token-Lebensdauern (15 min Access, 30 Tage Refresh); Token-Audit-Trail 30 Tage; auth.users 10 Jahre wie Projekt-Daten
- **TOM-Referenz**: TOM-2, TOM-3, TOM-4, TOM-5

## V11 - Buerger-Chat Strota Kommune (Phase 30)

- **Zweck**: Buerger-Service der Gemeinde
- **Rechtsgrundlage**: Art. 6(1)(e) DSGVO (Aufgabenwahrnehmung im oeffentlichen Interesse der Gemeinde) - hier ist die Gemeinde Verantwortlicher, Strota Auftragsverarbeiter
- **Datenkategorien**: Chat-Inhalt, IP-Hash
- **Sub-Processor**: Anthropic via AWS Bedrock
- **Aufbewahrung**: 6 Monate Beweissicherung (Gemeinde-Eigentum); konfigurierbar pro Vertrag
- **TOM-Referenz**: TOM-1 bis TOM-7

---

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) | Founder |
