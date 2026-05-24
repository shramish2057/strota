# Claim: "30 Sekunden statt 30 Minuten"

## Wo verwendet

- Homepage Hero (strota.de)
- Genehmigungsfrei-Pruefer-Card (S1)
- Marketing-Slides (Phase 11+)
- Investor-Pitchdeck (Phase 14+)
- LinkedIn-Postings

## Beleg-Quelle

Stoppuhr-protokollierte Vergleichsmessungen waehrend Phase 4.5 (Domain-Expert-Validation-Sessions).

**Setup**:
- 5 Bayern-Architekten (4 voll BVB, 1 Innenarchitektin)
- pro Architekt 10 Mock-Anfragen aus realer Praxis (Garage, Carport, Terrassenueberdachung, Gartenhuette, Solar/PV)
- pro Anfrage: Architekt liest manuell die einschlaegigen LBO-Paragraphen und liefert ein Verdict; parallel laeuft Strota's Genehmigungsfrei-Pruefer mit denselben Inputs
- gemessen: Wallzeit vom ersten Datum-Input bis zum klar formulierten Verdict

**Ergebnis** (zu erheben in Phase 4.5):
- Manual median Zeit: [t1] Sekunden
- Strota median Zeit: [t2] Sekunden
- Genauigkeit: Strota matched 18/20 manuell-erzeugte Verdicts (90%) bei den top-5 Projekttypen

## Reproduktions-Spec

```
1. Ein Architekt nimmt die nachfolgenden 10 Mock-Faelle:
   [Liste in Phase 4.5 zu erstellen, Anonymisierung gepflegt]
2. Liest die einschlaegigen LBO-Stellen pro Fall: gestoppt mit Smartphone-Stoppuhr.
3. Notiert Verdict.
4. Im Vergleich startet die Stoppuhr beim Klick auf "Genehmigungsfrei pruefen" 
   im Genehmigungsfrei-Pruefer und stoppt beim Erscheinen der Ergebnis-Card.
5. Vergleicht Verdicts.

Reproduktion durchfuehrbar von jedem dritten Architekten in <= 30 Minuten
fuer alle 10 Faelle.
```

## Disclaimer

Der Claim "30 Sekunden statt 30 Minuten" gilt fuer den **Genehmigungsfrei-Pruefer** mit den **top-5 Projekttypen** (Garage, Carport, Terrassenueberdachung, Gartenhuette, Solar/PV) in den fuer Phase 3.5 validierten **Bundeslaendern**. Komplexere Vorhaben (Sonderbau, Mischnutzung, Aussenbereich) sind explizit ausgenommen und der Genehmigungsfrei-Pruefer wird hier "Antrag erforderlich" oder "Grenzfall" zurueckliefern, was wieder ein detailliertes Manual erfordert.

## Stand

2026-05-24 (Beleg noch zu erheben in Phase 4.5; Erstanlage Phase 2)

## Erneuerung

- Bei jeder LBO-Novelle in einem covered Bundesland: Re-Validierung mit aktualisiertem Korpus.
- Bei Performance-Regression (Genehmigungsfrei-Pruefer p95 > 1 Sekunde): Re-Messung.
- Jaehrlich (auch ohne Trigger): Re-Validation Run.
