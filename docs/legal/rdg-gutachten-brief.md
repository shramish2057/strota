# Anwaltsbrief: Auftrag zum Gutachten ueber RDG-Konformitaet

**Stand**: 2026-05-24
**Empfaenger**: [Anwalt fuer IT-Recht / RDG, Identifikation in Phase 2]
**Auftraggeber**: Strota (in Gruendung)
**Budget**: € 2.500-5.000
**Antwort-Frist**: vor Phase 15.5 (Strota Fragt Live-Gang)

---

Sehr geehrte Frau / Herr [Name],

ich darf Sie bitten, uns ein Rechtsgutachten zur Vereinbarkeit unseres Produkts mit dem Rechtsdienstleistungsgesetz (RDG) zu erstellen. Den Auftrag bestaetige ich verbindlich vorbehaltlich Ihrer separat zugeschickten Honorar-Aufstellung.

## 1. Kurzbeschreibung des Produkts

Strota ist eine SaaS-Plattform fuer Architekten, Bauingenieure und Stadtplaner in der DACH-Region. Sie unterstuetzt bei der Vorbereitung und Vollstaendigkeitspruefung von Bauantragsunterlagen. Die berufsstandes-Erforderlichkeit eines bauvorlageberechtigten Entwurfsverfassers bleibt unberuehrt; Strota substituiert nicht den Architekten, sondern erbringt unterstuetzende Werkzeuge.

Drei Funktionen beruehren potenziell den Anwendungsbereich des RDG:

### 1.1 Vollstaendigkeitspruefer

Ein Architekt laedt seine Bauantragsunterlagen hoch; Strota analysiert mit Hilfe eines KI-Systems (Anthropic Claude) und einer regelbasierten Engine, ob die Unterlagen vollstaendig sind. Output ist ein "Score" (0-100), eine Liste fehlender Dokumente, und eine Liste von Inkonsistenzen.

### 1.2 Verfahrensbestimmung

Strota bestimmt anhand Adresse, Projekttyp, Gebaeudeklasse und Bundesland die anwendbare Verfahrensart (verfahrensfrei / Freistellung / vereinfacht / Genehmigung / Sonderbau / Kenntnisgabe-BW). Output ist die Verfahrensart mit Norm-Zitation.

### 1.3 Strota Fragt (Cited Baurecht Q&A)

Ein Architekt stellt eine abstrakte Frage zum Baurecht; Strota beantwortet mit Norm-Zitation aus dem hauseigenen Korpus. Beispiel: "Wann brauche ich einen Pruefsachverstaendigen in Bayern?" antwortet mit Art. 62 Abs. 2 BayBO.

## 2. Strota's Strategie zur RDG-Konformitaet

Wir gehen davon aus, dass Strota keine Rechtsdienstleistung iSd § 2 Abs. 1 RDG erbringt, sondern entweder:

(a) **abstrakte Norm-Auskunft** liefert (keine Pruefung des Einzelfalls iSd RDG),
(b) ein **Tool zur Unterstuetzung** des berufsmaessigen Bauvorlageberechtigten ist (der Bauvorlageberechtigte ist die eigentliche rechtspruefende Instanz),
(c) im Rahmen des § 6 RDG (unentgeltliche Rechtsdienstleistung ausserhalb persoenlicher Beziehungen) liegt, soweit grenzwertig.

Konkrete Sachverhalt-Subsumtion ist durch einen vorgeschalteten LLM-Classifier ausgeschlossen: Fragen mit Bezug auf konkrete Adressen, Personen oder Vorhabens-Details werden mit "Bitte Architekt / Anwalt konsultieren" abgewiesen.

Jeder Output traegt einen Pflicht-Disclaimer:
"Strota liefert Texte und Daten zur Unterstuetzung Ihrer beruflichen Arbeit. Strota ist kein Rechtsdienstleister iSd § 10 RDG. Die rechtliche Pruefung des Einzelfalls obliegt Ihnen als bauvorlageberechtigter Entwurfsverfasser bzw. einem Rechtsanwalt."

Strota wird ausschliesslich an berufsmaessige Bauantragsteller vermarktet (Architekten, Bauingenieure mit BVB, Stadtplaner mit BVB, Innenarchitekten innerhalb Innenausbau-Scope). Endkundenfreies Q&A nur fuer Kammer-validierte Architekten unlimited.

## 3. Pruef-Bitten

Bitte beurteilen Sie konkret:

1. **Greift unsere Strategie?** Insbesondere: Liegt die abstrakte Norm-Auskunft tatsaechlich ausserhalb § 2 Abs. 1 RDG?
2. **Wo sind die Grenzfaelle?** Wo wird aus "abstrakter Auskunft" eine "konkrete Einzelfall-Pruefung"? Wie scharf muessen wir filtern?
3. **Reicht der RDG-Classifier?** Welche Mindestgenauigkeit muessen wir nachweisen? Welche Disclaimer-Form ist BGH-konform?
4. **§ 5 RDG Nebenleistung**: Greift das fuer den Vollstaendigkeitspruefer, der im Rahmen der Tool-Nutzung (Hauptleistung) inzident Norm-Bezuege herstellt?
5. **Adressatenkreis-Beschraenkung auf Architekten**: Ist die Beschraenkung ausreichend? Reicht E-Mail-Verifikation, oder muessen wir Kammer-Eintragung verifizieren?
6. **Bauherr als Endkunde via Guest-Link**: Der Bauherr sieht sein eigenes Projekt (Daten zu sich), aber keine Baurecht-Auskuenfte. Beruehrt das RDG?
7. **Wettbewerbsrechtliche Risiken**: Wahrscheinlichkeit einer Wettbewerbszentrale- oder Verein-gegen-unlauteren-Wettbewerb-Klage; Best-Practice fuer praeventive Massnahmen.
8. **Handlungsempfehlung fuer Strota Kommune (Phase 30, B2G)**: Der Buerger-Chat ist B2C, im Auftrag der Gemeinde. Verschiebt sich die RDG-Bewertung?
9. **Mode-Schalter**: Strota Fragt hat einen Mode-Schalter (full / read-only / shutdown). Soll dieser Standard "read-only" sein bis ein Praezedenz-Urteil zu KI + RDG vorliegt?
10. **Empfehlung zur Versicherung**: Ist eine Berufshaftpflicht / Cyber-Versicherung mit € 5 Mio. ausreichend, oder empfehlen Sie eine spezifische Rechtsschutzversicherung fuer RDG-Streitigkeiten?

## 4. Lieferform

- Gutachten in PDF, deutsche Sprache
- 10-15 Seiten ausreichend
- Klare Handlungsempfehlung (was tun, was lassen, was monitoren)
- Geltungsdauer 12 Monate; Re-Bewertung nach RDG-Novelle oder BGH-Urteil

## 5. Vertraulichkeit

Das Gutachten ist vertraulich. Strota legt es nicht oeffentlich vor. Es wird intern unter `/legal/private/rdg-gutachten-2026-v1.pdf` archiviert.

## 6. Zeitlicher Rahmen

Bitte um Bestaetigung des Auftrags und Honorar-Aufstellung bis [Datum]. Lieferung des Gutachtens bis [Datum] = vor Phase 15.5 Strota-Fragt-Live-Gang (Roadmap: Week 26-27 von Project Start).

Bei Rueckfragen stehe ich gerne zur Verfuegung.

Mit freundlichen Gruessen

[Strota Founder]
hallo@strota.de
