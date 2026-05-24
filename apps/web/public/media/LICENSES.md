# Strota: Bildlizenzen und Medien-Slots

Strota nutzt fuer Marketing-Visuals ueberwiegend Inline-SVG plus dezente Farbflaechen, damit die Startseite ohne Bild-Abhaengigkeiten faellt. Wenn Sie spaeter echte Pexels-Fotos einsetzen wollen, dokumentieren Sie sie hier nach folgendem Schema.

## Slot-Verzeichnis

Die Startseite besitzt folgende Slots, die heute durch SVG/CSS-Art belegt sind. Falls Sie ein Foto einsetzen, legen Sie die Datei unter dem dokumentierten Pfad ab und tragen Sie unten Lizenz und Foto-URL nach.

| Slot                     | Pfad                                | Empfohlene Pexels-Suchbegriffe                                       |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------------- |
| Hero Bauantrags-Kontext  | `/media/hero.webp`                  | "modern german architecture", "blueprint office", "architect desk"   |
| Planen-Card              | `/media/feature-planen.webp`        | "modern facade germany", "construction blueprint top down"           |
| Sanieren-Card            | `/media/feature-sanieren.webp`      | "old building renovation", "facade scaffolding", "heritage facade"   |
| Umbauen-Card             | `/media/feature-umbauen.webp`       | "interior renovation", "attic conversion", "loft extension"          |
| Sozialer Beweis Portraet | `/media/testimonial-architect.webp` | "architect portrait office", "german professional portrait neutral"  |
| CTA-Hintergrund          | `/media/cta-band.webp`              | "blueprint texture closeup", "concrete texture neutral"              |

## Pexels-Lizenz

Pexels-Fotos sind nach der Pexels-Lizenz nutzbar:

- Kostenlos fuer kommerzielle und private Nutzung.
- Keine Attributionspflicht. Wir nennen die Fotografin trotzdem freiwillig, weil das fair ist.
- Keine identifizierbaren Personen ohne Modelfreigabe in einer Weise zeigen, die ihrem Ruf schaden koennte.
- Pexels-Fotos nicht unveraendert weiterverkaufen.

Quelle: https://www.pexels.com/license/

## Aktive Pexels-Medien

| Datei                         | Slot                   | Pexels-URL                                 | Fotografin                | Hochgeladen am |
| ----------------------------- | ---------------------- | ------------------------------------------ | ------------------------- | -------------- |
| `hero-placeholder.mp4`        | Startseite Hero Banner | https://www.pexels.com/video/1721294/      | _Verifikation ausstehend_ | 2026-05-24     |
| `hero-poster.jpg`             | Hero Poster Fallback   | https://www.pexels.com/video/1721294/      | _Verifikation ausstehend_ | 2026-05-24     |

> **Hinweis Platzhalter**: `hero-placeholder.mp4` zeigt eine urbane Strassenszene
> aus London und ist nur ein Platzhalter, bis ein passendes DACH-Architektur-Video
> ausgewaehlt ist. Ersatz erfolgt durch (a) Pexels-API-Suche mit `PEXELS_API_KEY`
> oder (b) gezielte Pexels-URL-Auswahl. Beim Ersatz: Datei ueberschreiben und Zeile
> oben aktualisieren mit echtem Photographer-Credit.

## Inline-SVG und CSS-Art

Die Hero-Komposition (`apps/web/src/components/home/hero-illustration.tsx`) und das Produktvorschau-Mock (`apps/web/src/components/home/product-preview.tsx`) sind eigene Werke der Strota-Designsysteme und unterliegen der Strota-Lizenz fuer Eigenwerke (intern; spaetere Open-Source-Entscheidung offen).
