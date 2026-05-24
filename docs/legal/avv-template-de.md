# Auftragsverarbeitungsvertrag (AVV) gemaess Art. 28 DSGVO

**Strota-Vorlage v1.0 - Stand 2026-05-24**

> Diese Vorlage muss anwaltlich finalisiert werden (Phase 2 Budget € 800-1.500). Sie ist Customer-facing und wird bei jedem ersten kostenpflichtigen Vertragsschluss signiert. Sie wird unter `strota.de/avv` veroeffentlicht.

---

zwischen

**[Architekturbuero / Bautraeger / Planungsbuero] (im Folgenden "Verantwortlicher")**

und

**Strota [GmbH in Gruendung] (im Folgenden "Auftragsverarbeiter")**

---

## 1. Gegenstand und Dauer des Auftrags

(1) Der Auftragsverarbeiter erbringt fuer den Verantwortlichen folgende Leistungen ("Services") unter Verarbeitung personenbezogener Daten:

- Vorbereitung, Vollstaendigkeitspruefung und Einreichung von Bauantragsunterlagen
- AI-assistierte Texterzeugung (Baubeschreibung, Briefe)
- Cited Q&A-Funktion (Strota Fragt) gemaess RDG-konformer Strategie
- B-Plan-Analyse mit Architect-Confirmation-Gate
- Verwaltung von Bauherren-, Eigentuemer-, Bauleiter-, Fachplaner- und Nachbar-Stammdaten
- qeS-Signatur-Workflows
- Korrespondenz mit Bauamt / Bauaufsichtsbehoerde

(2) Die Dauer des Auftrags entspricht der Dauer des Service-Abonnements zuzueglich der gesetzlichen Aufbewahrungsfristen (HOAI § 14, AO § 147, HGB § 257).

## 2. Art und Zweck der Verarbeitung

Vorbereitung und Validierung von Bauantragsunterlagen; AI-assistierte Texterzeugung; sichere Speicherung waehrend der gesetzlichen Aufbewahrungsfristen (10 Jahre).

## 3. Art der personenbezogenen Daten

- Bauherr-Stammdaten (Name, Adresse, ggf. Geburtsdatum wo statutarisch verlangt, Eigentumsdaten, Vollmachts-Inhalt)
- Eigentuemer-Daten (wenn != Bauherr)
- Projekt-Adressdaten
- Fachplaner-Stammdaten
- Bauleiter-Stammdaten
- Kommunikations-Metadaten
- qeS-Zertifikatsdaten
- ggf. Nachbar-Stammdaten (bei freiwilliger Beteiligung)

## 4. Kategorien betroffener Personen

- Bauherren (natuerliche und juristische Personen, Bauherrengemeinschaften, Erbengemeinschaften, WEG)
- Eigentuemer
- Nachbarn (im Rahmen freiwilliger Beteiligung)
- Bauleiter
- Fachplaner
- Mitarbeiter im Architektenbuero
- Buerger (bei Strota Kommune)

## 5. Pflichten und Rechte des Verantwortlichen

(1) Der Verantwortliche bleibt fuer die Beurteilung der Zulaessigkeit der Verarbeitung verantwortlich (Art. 24 DSGVO) sowie fuer die Wahrung der Rechte der Betroffenen (Art. 12-22 DSGVO).

(2) Der Verantwortliche entscheidet ueber Art und Umfang der Verarbeitung und ist gegenueber dem Auftragsverarbeiter weisungsbefugt.

(3) Der Verantwortliche erfuellt seine Informationspflichten gegenueber den Bauherren nach Art. 13 DSGVO via den vom Auftragsverarbeiter bereitgestellten Bauherr-Guest-Link-Onboarding-Flow.

(4) Der Verantwortliche beachtet seine berufsrechtliche Verschwiegenheitspflicht (Berufsordnung der jeweiligen Landes-Architektenkammer).

## 6. Pflichten des Auftragsverarbeiters

(1) Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschliesslich im Rahmen der getroffenen Vereinbarungen und nach den Weisungen des Verantwortlichen.

(2) Der Auftragsverarbeiter trifft die nach Art. 32 DSGVO erforderlichen technischen und organisatorischen Massnahmen (TOMs; siehe § 7).

(3) Der Auftragsverarbeiter unterstuetzt den Verantwortlichen bei der Beantwortung von Antraegen Betroffener (Art. 12-22 DSGVO).

(4) Der Auftragsverarbeiter meldet Verletzungen des Schutzes personenbezogener Daten unverzueglich, spaetestens innerhalb 72 Stunden nach Kenntnisnahme.

(5) **Trainings-Ausschluss**: Der Auftragsverarbeiter verwendet die personenbezogenen Daten des Verantwortlichen NIEMALS fuer das Training, Re-Training oder Fine-Tuning von KI-Modellen, weder eigener noch von Sub-Auftragsverarbeitern (insbesondere Anthropic). Diese Zusicherung ist in den jeweiligen Sub-Processor-Vertraegen durchgereicht.

(6) **Berufsgeheimnis-Klasse**: Der Auftragsverarbeiter behandelt Bauherr-Daten und Bauunterlagen als Berufsgeheimnis-Klasse (siehe data-classification.md): kein Mitarbeiter-Zugriff ohne Ticket + Vier-Augen-Prinzip; Audit-Log jeder priviligierten Lesung.

## 7. Technische und organisatorische Massnahmen (TOMs)

Die vollstaendigen TOMs sind unter `strota.de/toms` veroeffentlicht (Auszuege) und vertraulich in `/docs/compliance/toms.md` dokumentiert. Sie umfassen mindestens:

- Verschluesselung at-rest (AES-256) und in-transit (TLS 1.3+, mTLS inter-service)
- Row-Level Security auf jeder Datenbank-Tabelle
- Audit-Log mit race-safe Hash-Chain (Tamper-Detection)
- qeS-Signatur-Workflow mit PAdES-LTV fuer 10-Jahres-Archivierung
- Hourly pgbackrest snapshots + weekly cross-region Backup
- Documented DR-Posture: RTO 4 h, RPO 24 h, semi-annual Drills
- Pen-Test jaehrlich + Bug-Bounty (ab Phase 25)
- ISO 27001 + 27701 Roadmap (Zertifizierung Year 3)
- BSI C5 fuer Strota Kommune

## 8. Unterauftragsverarbeiter

(1) Eine Liste der eingesetzten Unterauftragsverarbeiter ist als **Anlage 1** beigefuegt.

(2) Der Auftragsverarbeiter informiert den Verantwortlichen mindestens 30 Tage vor Hinzufuegung oder Aenderung eines Unterauftragsverarbeiters.

(3) Der Verantwortliche hat ein Widerspruchsrecht.

(4) Der Auftragsverarbeiter schliesst mit jedem Unterauftragsverarbeiter einen Vertrag, der mindestens die in Art. 28 Abs. 3 DSGVO vorgesehenen Datenschutzpflichten auferlegt.

## 9. Rechte der Betroffenen

(1) Der Auftragsverarbeiter unterstuetzt den Verantwortlichen bei Antraegen Betroffener auf Auskunft (Art. 15), Berichtigung (Art. 16), Loeschung (Art. 17), Einschraenkung (Art. 18), Portabilitaet (Art. 20) und Widerspruch (Art. 21) im Rahmen seiner Moeglichkeiten.

(2) Der Workflow ist unter `/docs/compliance/dsr-workflow.md` dokumentiert.

(3) Der Verantwortliche initiiert die Bearbeitung via Customer Portal oder API; der Auftragsverarbeiter fuehrt aus mit Beachtung der 10-Jahres-Aufbewahrungspflichten.

## 10. Kontrollrechte des Verantwortlichen

(1) Der Verantwortliche hat das Recht, die Einhaltung der gesetzlichen Vorschriften zum Datenschutz und der vertraglichen Vereinbarungen beim Auftragsverarbeiter zu kontrollieren.

(2) Diese Kontrolle erfolgt remote via aktuelle Zertifikate (ISO 27001 / 27701 / SOC 2 Type II ab Phase 25+) oder vor Ort nach vorheriger Ankuendigung.

## 11. Datenrueckgabe und Loeschung bei Vertragsende

(1) Bei Vertragsende exportiert der Auftragsverarbeiter saemtliche personenbezogenen Daten des Verantwortlichen innerhalb von 30 Tagen als ZIP-Archiv. Inhalt: eingereichte PDFs + XBau-XML + Originaldateien + Audit-Log-Auszug pro Projekt + Bauherren-Stammdaten + qeS-Signatur-Nachweise.

(2) Danach loescht der Auftragsverarbeiter die Daten unter Beachtung der gesetzlichen Aufbewahrungsfristen (HOAI / AO / HGB). Soft-Delete 90 Tage; Hard-Delete via Lifecycle-Cron nach 10 Jahren.

(3) Audit-Log bleibt bestehen (Beweissicherung).

## 12. Haftung und Versicherung

(1) Die Haftung des Auftragsverarbeiters bestimmt sich nach Art. 82 DSGVO.

(2) Der Auftragsverarbeiter unterhaelt eine Berufshaftpflicht- / Cyber-Haftpflichtversicherung mit Mindestdeckung € 5 Mio. fuer Vermoegensschaeden und € 5 Mio. fuer Personen- / Sach-Schaeden. Versicherungsnachweis auf Anfrage. Erhoehte Deckung € 10 Mio. fuer Strota-Kommune-Vertraege.

## 13. Schlussbestimmungen

(1) Aenderungen dieses Vertrages beduerfen der Schriftform.

(2) Sollte eine Bestimmung dieses Vertrages unwirksam sein, beruehrt dies nicht die Wirksamkeit der uebrigen Bestimmungen.

(3) Es gilt deutsches Recht. Gerichtsstand ist der Sitz des Auftragsverarbeiters.

---

## Anlage 1 - Unterauftragsverarbeiter

Aktuelle Liste unter `strota.de/sub-processors`. Stand 2026-05-24:

| Sub-Auftragsverarbeiter | Zweck | Region | DPA |
|-------------------------|-------|--------|-----|
| Hetzner Online GmbH | Compute, Object Storage, private network | DE (NUE + FAL) + FI (HEL backup) | signed |
| Cloudflare Inc. | DDoS, WAF, Tunnel, CDN | global; EU termination | signed (incl. SCC) |
| Vercel Inc. | Edge Functions, Web Hosting | EU-Frankfurt | signed |
| AWS Amazon Web Services | Bedrock-Hosting fuer Anthropic | eu-central-1 Frankfurt | signed (AWS-DPA + SCC) |
| Anthropic PBC | Claude AI (via Bedrock pass-through) | EU-Frankfurt | signed + KI-Trainings-Ausschluss |
| Postmark | Transactional Email | EU | signed |
| Stripe Payments Europe Ltd. | Payment processing | EU entity | signed (incl. SCC) |
| HashiCorp Vault (self-hosted) | Secrets management | DE (Hetzner) | n/a |
| Sentry (self-hosted) | Error tracking | DE (Hetzner) | n/a |
| PostHog (self-hosted) | Product analytics (consent-gated) | DE (Hetzner) | n/a |
| Chatwoot (self-hosted) | Customer Support | DE (Hetzner) | n/a |
| D-Trust GmbH (Bundesdruckerei) | qeS Signatur Primary | DE | signed |
| Bundesdruckerei | qeS Signatur Failover | DE | signed |
| A-Trust (Phase 26+) | AT Handysignatur / ID Austria | AT | signed |
| SwissSign (Phase 27+) | CH SuisseID / SwissID | CH | signed |
| BKG Bundesamt fuer Kartographie | Address-to-AGS | DE (federal) | Nutzungsbedingungen |
| Better Uptime | Uptime monitoring + status page | EU | signed |
| Consentmanager.net / Usercentrics | Cookie consent management | DE | signed |
| Intigriti EU (Phase 25+) | Bug-Bounty | EU | signed |
| PagerDuty | Incident alerting | EU | signed |

---

## Unterzeichnung

Verantwortlicher:

Datum, Ort:

Name, Funktion:

Unterschrift:

---

Auftragsverarbeiter (Strota):

Datum, Ort:

Name, Funktion:

Unterschrift:

---

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) - vor anwaltlicher Finalisierung | Founder |
