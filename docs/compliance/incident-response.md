# Incident Response Plan (Art. 33/34 DSGVO)

Living document. Pflicht-Review jaehrlich + nach jedem Incident.

**Stand**: 2026-05-24
**On-Call**: PagerDuty Schedule `strota-sre-primary` (Phase 14 aktiviert)
**Eskalations-Chat**: `#incident-response` (Chatwoot-internal von Phase 16; bis dahin Signal-Gruppe)

## Severity-Klassifizierung

| Sev | Definition | Reaktion |
|-----|-----------|----------|
| P1 | PII-Lek, Service voellig down, Auth-Bypass, Geld-Schaden, qeS-Faelschung | unverzueglich Founder + Legal + Comms; 72h-Meldepflicht prueft Legal binnen 4 h |
| P2 | Teil-Service-Ausfall, einzelner Kunden-Account kompromittiert, Sub-Processor-Vorfall ohne Strota-Daten-Bezug | Founder + Eng-Lead innerhalb 1 h; Triage binnen 4 h |
| P3 | Minor Bug ohne Sicherheits-Auswirkung | Async, naechste Working-Hour |

## Workflow

### Phase 1 - Detection (T+0)
- Quellen: Sentry-Alert, audit-chain-Mismatch (taegliches verify_audit_chain Cron), externer Hinweis (security@strota.de), Sub-Processor-Notification, Pen-Test- oder Bug-Bounty-Befund
- On-Call SRE bestaetigt via PagerDuty; oeffnet Incident-Ticket

### Phase 2 - Triage (<= 1 h)
- Severity-Klassifizierung
- Initial-Scope: welche Datenkategorien betroffen?
- Initial-Scope: wieviele Betroffene?
- Bei P1 PII-Lek: **Legal startet die 72h-Uhr Art. 33**

### Phase 3 - Containment (<= 4 h)
- Sofortmassnahmen:
  - Service-Pause via Cloudflare Worker (Maintenance-Mode)
  - HMAC- + JWT-Signing-Key Rotation
  - mTLS-Cert-Revocation (Redis CRL)
  - Account-Sperrungen (`UPDATE auth.users SET locked_until = 'infinity' WHERE ...`)
  - Refresh-Token-Massenrevocation pro betroffenem Org

### Phase 4 - DPA-Notification (<= 72 h, nur bei PII-Lek)
- Aufsichtsbehoerde: **Bayerisches Landesamt fuer Datenschutzaufsicht (BayLDA)** wenn Strota's eigene Verantwortlichen-Daten betroffen; sonst die zustaendige LDA des Architekturbueros (Strota benachrichtigt das Architekturbuero zeitnah, das wiederum benachrichtigt seine LDA)
- Form: BayLDA Online-Meldeformular oder schriftliche Meldung
- Inhalt (Art. 33 Abs. 3): Art der Verletzung, betroffene Datenkategorien, ungefaehre Zahl Betroffener, Auswirkungen, Massnahmen, Kontakt DSB

### Phase 5 - Customer-Notification (<= 72 h, AVV §6)
- E-Mail-Template `/legal/incident-templates/customer-notification.de.md` (Phase 2 Anwalt-Review steht aus)
- In-App-Banner via Cloudflare Worker
- Falls Status-Page-Wuerdig: status.strota.de aktualisieren

### Phase 6 - Bauherr-Notification (Art. 34, indirekt)
- Strota informiert die betroffenen Architekturbueros mit konkreten Bauherr-Listen
- Architekturbueros sind Verantwortliche und benachrichtigen ihre Bauherren direkt
- Strota stellt Vorlage `/legal/incident-templates/bauherr-notification.de.md`

### Phase 7 - Post-Mortem (<= 30 Tage)
- Blameless Post-Mortem-Doc unter `/docs/incidents/INC-YYYYMMDD-slug.md`
- Action-Items mit Owner + Faelligkeit
- ROPA-Update falls Verarbeitungsbedingungen sich aendern
- TOMs-Update falls neue Massnahme noetig
- Customer-Update wenn Anwender betroffen

### Phase 8 - Insurance-Claim (bei finanziellem Schaden)
- Cyber-Versicherung kontaktieren <= 5 Werktage (Cyber-Versicherung Phase 2 + 14)

## Eskalations-Matrix

| Trigger | Founder | Eng-Lead | Legal | Comms | Insurance |
|---------|---------|----------|-------|-------|-----------|
| P1 PII-Lek | sofort | sofort | sofort | sofort (bei Public-Visible) | <= 5 Werktage |
| P1 Service-Down | sofort | sofort | optional | optional | nur bei SLA-Verletzung mit Folgen |
| P2 | innerhalb 1 h | innerhalb 1 h | bei Bedarf | nein | nein |
| P3 | naechste Working-Hour | naechste Working-Hour | nein | nein | nein |

## Mustervorlagen

`/legal/incident-templates/` (Phase 2 Anwalt-Review):

- `customer-notification.de.md`
- `bauherr-notification.de.md`
- `bayLDA-report.de.md`
- `internal-postmortem.md`

## Letzte Inzidente

(keine; clean slate)

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) | Eng-Lead + Legal |
