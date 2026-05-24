# RDG-Compliance-Strategie (Rechtsdienstleistungsgesetz)

**Stand**: 2026-05-24
**Pflicht-Gutachten**: anwaltlich (Phase 2; Budget € 2.500-5.000)
**HARD GATE**: Strota Fragt (Phase 15.5) wird NICHT freigegeben ohne dieses Gutachten.

## Rechtslage

§ 2 Abs. 1 RDG: "Rechtsdienstleistung ist jede Taetigkeit in konkreten fremden Angelegenheiten, sobald sie eine rechtliche Pruefung des Einzelfalls erfordert."

Strota Fragt, Vollstaendigkeitspruefer, und Verfahrensbestimmung beruehren diese Definition. Eine pauschale Subsumtion "Strota macht keine Rechtsdienstleistung" haelt nicht.

## Strota's Strategie

### 1. Abstrakte Rechtsfragen statt konkrete Subsumtion

Strota Fragt beantwortet nur abstrakte Norm-Fragen ("Was sagt § 31 BauGB?", "Welche Abstandsflaechen gelten in Bayern?"). Konkrete Sachverhalts-Subsumtion ("Darf ich auf meinem Grundstueck Y bauen?") wird vom RDG-Classifier abgewiesen.

### 2. Tool-Empfehlung statt Beratung

Outputs sind formuliert als: "Aus dem Korpus zur Frage X liefern wir folgende Norm-Texte und strukturierte Daten; die rechtliche Wuerdigung im konkreten Fall obliegt dem Architekten bzw. einem Rechtsanwalt." Keine "Sie sollten X tun"-Formulierungen.

### 3. Pflicht-Disclaimer pro Output

Q&A, Vollstaendigkeits-Score, Verfahrensbestimmung, Befreiungs-Begruendung tragen jeweils diesen Disclaimer:

> "Strota liefert Texte und Daten zur Unterstuetzung Ihrer beruflichen Arbeit. **Strota ist kein Rechtsdienstleister** iSd § 10 RDG. Die rechtliche Pruefung des Einzelfalls obliegt Ihnen als bauvorlageberechtigter Entwurfsverfasser bzw. einem Rechtsanwalt."

### 4. Adressatenkreis: berufsmaessige Bauantragsteller

Strota wird ausschliesslich an Architekten, Bauingenieure mit BVB, Stadtplaner mit BVB, Innenarchitekten innerhalb Innenausbau-Scope vermarktet. Bauherren als Endkunden adressiert Strota nicht direkt (nur via Guest-Link zu einem konkreten Projekt ihres Architekten - dort sehen sie ihren Antrag, keine generellen Rechtsauskuenfte).

Endkundenfreie Q&A nur fuer Kammer-validierte Architekten unlimited; sonst 10 Fragen/Monat.

### 5. § 6 RDG (unentgeltliche Rechtsdienstleistungen) als Fallback

Wo Strota dennoch grenzwertige Outputs liefert: unentgeltliche Taetigkeit "ausserhalb familiaerer, nachbarschaftlicher oder aehnlicher persoenlicher Beziehungen" ist erlaubt; Strota Fragt-Outputs sind nicht-individualisiert, abstrakt, automatisiert und fallen typischerweise nicht in den Regelungsbereich des RDG.

### 6. § 5 RDG (Nebenleistung)

Wo Strota im Rahmen einer anderen Hauptleistung (Korpus-Bereitstellung, Tool-Vermietung) inzident Rechtsinformationen liefert, ist das nach § 5 RDG zulaessige Nebenleistung.

## Implementierungs-Kontrollen

| Kontrolle | Implementiert in | Status |
|-----------|------------------|--------|
| RDG-Classifier (Haiku) klassifiziert Fragen vor Synthese | apps/api-python/src/strota_api/qa/ (Phase 15.5) | Roadmap |
| Pflicht-Disclaimer auf jedem Q&A-Output | gleicher Renderer | Roadmap |
| Sprach-/Region-Routing (DE/AT/CH); cross-region geroutet | gleicher Renderer | Roadmap |
| Endkunden-Frei-Tier nur fuer email-verifizierte Konten; Unlimited nur Kammer-validiert | apps/api-python/src/strota_api/auth/ + rate-limit | Phase 2 (Auth) + Phase 15.5 (Limits) |

## Monitoring

| Quelle | Trigger | Aktion |
|--------|---------|--------|
| Wettbewerbszentrale-Beschwerde | Eingang | Anwalt sofort; ggf. Strota-Fragt-Mode auf "read-only" oder "shutdown" schalten |
| Verein gegen unlauteren Wettbewerb (UWG) Mahnschreiben | Eingang | Anwalt sofort |
| RDG-Novelle | Bundesgesetzblatt-Monitoring | Quartalsweiser Legal-Review; Re-Bewertung |
| BGH-Urteil zu KI + Rechtsdienstleistung | Juristische Newsletter | Anwalt-Re-Review |

Strota Fragt hat einen Mode-Schalter (full / read-only / shutdown) verfuegbar so dass das Feature bei Rechtsstreit unter 1 Stunde abschaltbar ist.

## Gutachten-Brief

Der formelle Auftrag an den Anwalt liegt unter [docs/legal/rdg-gutachten-brief.md](../legal/rdg-gutachten-brief.md). Antwort/Gutachten landet unter `/legal/rdg-gutachten-2026-v1.md` (vertraulich, gitignored).

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) - vor anwaltlicher Bestaetigung | Founder + Legal-Beratung |
