# Datenklassifizierung

Living document. Pflicht-Review jaehrlich.

**Stand**: 2026-05-24

## Klassen

| Klasse | Beispiele | Handling | Speicherort |
|--------|-----------|----------|-------------|
| **Public** | Marketing-Texte, Bibliothek-Inhalte, Job-Postings, oeffentliche Korpus-Eintraege | keine Schutzanforderungen | apps/web statisch, packages/corpus public-Teil |
| **Internal** | Mitarbeiter-Onboarding-Docs, interne Roadmap, Eng-Decisions, ADRs | nur Strota-Team; nicht oeffentlich; nicht in PRs auf externen Repos | docs/, GitHub-Org internal repos |
| **Confidential** | Architekt-Stammdaten, Strota-Konten, Projekt-Metadaten ohne Bauherr-Bezug, Billing-Daten | RLS-gated; nur die zugehoerige Org; Audit-Log bei Lesung durch Strota-Service-Role | Postgres (Hetzner), Hetzner Object Storage |
| **Berufsgeheimnis** (Architekt-Mandanten-Daten) | Bauherr-Stammdaten, Eigentuemer-Daten, Bauplaene, Baubeschreibungen, vertraegliche Inhalte, qeS-signierte Dokumente | wie Confidential PLUS keine Mitarbeiter-Sichtung ohne Ticket + Vier-Augen-Prinzip; Audit-Log jeder priviligierten Lesung; keine Verwendung fuer KI-Training (AVV §6) | wie Confidential, mit zusaetzlichen Audit-Triggern |
| **Sicherheit** | Passwoerter (Hash), JWT-Signing-Keys, HMAC-Secret, qeS-API-Keys, Datenbank-Credentials | nie in Logs, nie in PRs, nie in Slack; nur in HashiCorp Vault; rotated monatlich (HMAC, JWT) oder quarterly (DB) | HashiCorp Vault (self-hosted), Hetzner env-vars per service-restart |

## Handling-Pflichten pro Klasse

### Public
- keine speziellen Pflichten
- darf in oeffentlichen Repos, auf Marketing-Channels, in PR-Bodies stehen

### Internal
- nicht in oeffentlichen Repos
- nicht in externen Slack-Channels
- darf in Strota-internen Tools (Notion, internes GitHub)

### Confidential
- Verschluesselung at-rest (AES-256) + in-transit (TLS 1.3+)
- RLS-Policy gegen Cross-Org-Read
- Audit-Log bei Lesung durch service-role
- Aufbewahrung 10 Jahre (HOAI/AO/HGB)
- Backup: hourly pgbackrest, weekly cross-region

### Berufsgeheimnis
- alle Pflichten von Confidential PLUS:
- Mitarbeiter-Sichtung **nur** mit Ticket + Vier-Augen-Prinzip + audit_log-Eintrag mit Reason
- KI-Training-Verbot (AVV §6, durchgereicht in Anthropic-Bedrock-DPA)
- bei DSR-Anfrage: Architekt entscheidet (er ist Verantwortlicher, Strota Auftragsverarbeiter)
- bei Pen-Test: Tester unterzeichnen separates NDA mit Berufsgeheimnis-Klausel

### Sicherheit
- **nie** in Plaintext irgendwo (Logs, Code, env-Files im Repo, Chat, Tickets)
- gitleaks CI prueft jeden PR auf Secret-Leaks (.github/workflows/security.yml)
- Vault stores secrets; Service liest beim Boot via env-vars die Vault injected
- Rotation: monatlich HMAC + JWT; quarterly DB-Passwoerter; per-Deploy mTLS-Certs
- bei Verdacht-Compromise: sofortige Rotation + Force-Logout aller User + Incident-Response

## Datenfluss-Beispiele

### Beispiel 1: Bauantrag (Berufsgeheimnis)

Browser -> Vercel Edge -> HMAC-signed POST -> Cloudflare Tunnel -> mTLS -> FastAPI -> Postgres (loopback) -> AES-256 storage. Bei AI-Analyse zusaetzlich: FastAPI -> Bedrock EU-Frankfurt (mit Trainings-Ausschluss).

### Beispiel 2: Passwort-Reset (Sicherheit + Confidential)

Browser -> Vercel -> FastAPI -> Postgres (Token-Hash-Speicherung, sha256(plaintext) at rest) -> Postmark (Plaintext-Token nur im Email-Body, nie geloggt).

### Beispiel 3: Q&A Strota Fragt (Public input, Public output)

Browser (kein Login) -> Vercel Edge -> rate-limited -> Cache-Lookup -> bei Miss: Bedrock -> Cache speichern. Frage-Text wird im Cache + Logs aufbewahrt nur wenn der RDG-Classifier "abstrakt" sagt; bei "konkret_sachverhalt" wird die Frage abgewiesen und nicht gespeichert.

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) | Eng-Lead + Legal |
