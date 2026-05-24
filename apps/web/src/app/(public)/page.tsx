import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@strota/ui';
import Link from 'next/link';
import { GenehmigungsfreiHeroForm } from '../../components/home/genehmigungsfrei-hero-form';
import { HeroVideo } from '../../components/home/hero-video';
import { SoftwareApplicationJsonLd } from '../../components/seo/json-ld';

export default function HomePage(): JSX.Element {
  return (
    <>
      <SoftwareApplicationJsonLd />
      <Hero />
      <StatsRow />
      <ThreePillars />
      <HowItWorks />
      <ComparisonTable />
      <LibraryTeaser />
      <CustomerStory />
      <FAQ />
      <ClosingCTA />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero(): JSX.Element {
  return (
    <section className="relative isolate overflow-hidden border-b border-neutral-200">
      <HeroVideo />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-900/95 via-primary-900/85 to-primary-900/45"
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="max-w-2xl text-white">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-100/90">
            KI-nativ · DSGVO · Bayern Live
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            Bauanträge in Stunden statt Wochen.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-100/90">
            Strota ist die KI-native Bauantragsplattform für Architekt:innen, Büros, Bauträger und Behörden in der DACH-Region. Verfahrensbestimmung in 30 Sekunden, Vollständigkeitsprüfung bevor das Bauamt sie sieht, qeS-signiert eingereicht. Heute live in Bayern.
          </p>
          <div className="mt-8 max-w-xl">
            <GenehmigungsfreiHeroForm />
          </div>
          <p className="mt-4 text-xs text-primary-100/70">
            Kein Konto nötig · DSGVO + BDSG · Hosting in Deutschland · Keine Auftragsdaten für KI-Training
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stats row, with real bible-cited numbers                                   */
/* -------------------------------------------------------------------------- */

function StatsRow(): JSX.Element {
  const stats = [
    {
      headline: '30 Sekunden',
      sub: 'Verfahrensbestimmung statt 30 Minuten LBO-Recherche pro Anfrage.',
    },
    {
      headline: '60 %',
      sub: 'der Bauantrags-Verzögerungen entstehen durch unvollständige Unterlagen (BBSR 2023).',
    },
    {
      headline: '8 Module',
      sub: 'plus 4 freie KI-Tools. Eine Plattform vom Vorhaben bis zur Einreichung.',
    },
  ];
  return (
    <section className="border-b border-neutral-200 bg-bg-subtle">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-3 lg:px-8">
        {stats.map((s) => (
          <div key={s.headline} className="text-center sm:text-left">
            <p className="font-display text-5xl text-primary-900 sm:text-6xl">{s.headline}</p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Three pillars: what makes Strota different (anti-incumbent positioning)    */
/* -------------------------------------------------------------------------- */

const PILLARS = [
  {
    eyebrow: 'KI-nativ',
    title: 'Cloud statt Desktop-Formularfüller aus 2002',
    body:
      'Bisherige Bauantrags-Software ist ein Word-Vorlagen-Wirtschaftssystem aus den frühen 2000ern: kein KI, keine Verfahrensbestimmung, keine B-Plan-Analyse, keine Vollständigkeitsintelligenz. Strota ist von Grund auf KI-nativ und läuft im Browser.',
    bullets: [
      'KI-gestützte Baubeschreibung, paragraphengenau zitiert',
      'Dokument-Analyse für Nachforderungs-Briefe in 60 Sekunden',
      'Strota Fragt: Baurecht-Q&A mit verlinkten Quellen',
      'Wöchentliche Korpus-Updates, kein Software-Update nötig',
    ],
    cta: { label: 'KI-Tools entdecken', href: '/fuer/architekten' },
    accentClass: 'bg-primary-700 text-white',
    cardClass: 'bg-primary-50',
  },
  {
    eyebrow: 'Deterministisch',
    title: 'Regelbasiert statt halluziniert',
    body:
      'ChatGPT macht Fehler bei §-Zitaten. Strota nicht. Jede Verfahrensbestimmung läuft deterministisch gegen den Strota-Korpus, jede Antwort verlinkt den Paragraphen, jede Norm-Fassung ist mit Stand-Datum versioniert.',
    bullets: [
      'Verfahrensbestimmung über BayBO Art. 57, 58, 59 plus DVO',
      'B-Plan-Analyzer für GRZ, GFZ, Trauf-/Firsthöhe, §31-Abweichungen',
      'Jede Begründung verlinkt die Rechtsquelle',
      'Korpus-Aktualisierung innerhalb 7 Werktagen nach Inkrafttreten',
    ],
    cta: { label: 'Plattform ansehen', href: '/plattform' },
    accentClass: 'bg-primary-900 text-white',
    cardClass: 'bg-bg-elevated',
  },
  {
    eyebrow: 'Vollständig',
    title: 'Vor der Einreichung, nicht im Nachgang',
    body:
      '60 % der Bauantrags-Verzögerungen entstehen durch unvollständige Unterlagen. Eine Nachforderung kostet 5 bis 15 Stunden Architektenzeit. Strota prüft Schicht 1 bis 4 bevor das Bauamt das Paket sieht.',
    bullets: [
      'Schicht 1: Präsenz aller Pflichtdokumente nach BauVorlV',
      'Schicht 2: Format und Dateigröße pro Bauamt',
      'Schicht 3: Inhalt (Maßstab, Nordpfeil, Pflicht-Angaben)',
      'Schicht 4: Fachprüfung (Statik, Brandschutz, GEG)',
    ],
    cta: { label: 'Vollständigkeitspruefer testen', href: '/signup' },
    accentClass: 'bg-accent-500 text-primary-900',
    cardClass: 'bg-bg-elevated',
  },
];

function ThreePillars(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-bg-base py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
            Was Strota anders macht
          </p>
          <h2 className="mt-3 font-display text-4xl text-primary-900 sm:text-5xl">
            KI-nativ. Deterministisch. Vollständig.
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Bauantrags-Software war 20 Jahre lang Desktop-Formularfüller mit Word-Export. Strota ist die erste Plattform, die KI, Regel-Engine und vollständige Rechtsquellen-Bibliothek in einem System verbindet.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <Card key={p.eyebrow} className={p.cardClass}>
              <CardHeader>
                <div
                  className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${p.accentClass}`}
                >
                  {p.eyebrow}
                </div>
                <CardTitle className="mt-4 font-display text-2xl leading-tight text-primary-900">{p.title}</CardTitle>
                <CardDescription className="mt-3 text-neutral-700">{p.body}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-neutral-800">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.cta.href}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
                >
                  {p.cta.label} <span aria-hidden>›</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works: three steps end-to-end                                       */
/* -------------------------------------------------------------------------- */

function HowItWorks(): JSX.Element {
  const steps = [
    {
      n: '01',
      title: 'Vorhaben eingeben, Verfahren bekommen',
      body: 'Adresse, Vorhaben, Eckdaten. Strota geokodiert gegen BKG, klassifiziert nach BayBO und liefert in 30 Sekunden Verfahrensart plus Rechtsgrundlage.',
    },
    {
      n: '02',
      title: 'Unterlagen sammeln, Strota prüft',
      body: 'Schicht 1 bis 4 (Präsenz, Format, Inhalt, Fachprüfung) laufen automatisch. Jede Lücke wird mit Quelle, Frist und Verantwortlichem markiert.',
    },
    {
      n: '03',
      title: 'qeS-signiert einreichen',
      body: 'eIDAS-qualifizierte Signatur, PAdES-LTV, Mehrpersonen-Workflow. Übergabe per OZG-Portal, XBau oder Papier-Konvention je Bauamt.',
    },
  ];
  return (
    <section className="border-b border-neutral-200 bg-bg-subtle py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
              So funktioniert es
            </p>
            <h2 className="mt-3 font-display text-4xl text-primary-900 sm:text-5xl">
              Drei Schritte, kein Hin und Her
            </h2>
            <p className="mt-4 text-base text-neutral-700">
              Kein Wartezimmer, keine Voranfragen, keine Excel-Tabellen mit Pflichtnachweisen. Strota führt vom Vorhaben bis zur Übergabe an das Bauamt.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Selbst ausprobieren <span aria-hidden>›</span>
            </Link>
          </div>
          <ol className="space-y-4">
            {steps.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-[3.5rem_1fr] items-start gap-5 rounded-md border border-neutral-200 bg-bg-elevated p-6"
              >
                <div className="font-mono text-3xl font-bold text-primary-500">{s.n}</div>
                <div>
                  <h3 className="font-display text-xl text-primary-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-700">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Comparison table vs incumbent desktop solutions                            */
/* -------------------------------------------------------------------------- */

const COMPARISON_ROWS: { topic: string; strota: string; desktop: string }[] = [
  {
    topic: 'Verfahrensbestimmung',
    strota: '30 Sekunden, deterministisch, mit Norm-Zitat',
    desktop: 'LBO selbst lesen, 30 Minuten pro Anfrage',
  },
  {
    topic: 'Vollständigkeit',
    strota: 'KI-Prüfer Schicht 1 bis 4 vor Einreichung',
    desktop: 'Statisches Formular, Lücken fallen erst beim Bauamt auf',
  },
  {
    topic: 'Baubeschreibung',
    strota: 'KI-generiert, paragraphengenau, Architekt bestätigt',
    desktop: 'Manuell aus Word-Vorlage zusammengeklickt',
  },
  {
    topic: 'B-Plan-Abgleich',
    strota: 'Automatischer GRZ-, GFZ-, Trauf-, First-Check',
    desktop: 'Excel-Tabelle, Hand-Vergleich',
  },
  {
    topic: 'Einreichung',
    strota: 'qeS + PAdES-LTV + XBau-Submit nativ',
    desktop: 'Drucken, Heften, Post',
  },
  {
    topic: 'Rechtsquellen',
    strota: 'Bibliothek mit jeder LBO, DVO, Satzung, Stand-Datum',
    desktop: 'Eigene PDF-Sammlung im Netzlaufwerk',
  },
  {
    topic: 'Updates',
    strota: 'Korpus innerhalb 7 Werktagen nach Norm-Inkrafttreten',
    desktop: 'Jährliches Update auf CD-ROM',
  },
  {
    topic: 'Mobil & Tablet',
    strota: 'Voll funktional, Stift-Eingabe für Plan-Annotation',
    desktop: 'Nur Desktop, pro Arbeitsplatz lizenziert',
  },
];

function ComparisonTable(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-bg-base py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
            Strota vs. klassische Bauantrags-Software
          </p>
          <h2 className="mt-3 font-display text-4xl text-primary-900 sm:text-5xl">
            Vom Formularfüller zur KI-Plattform
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Die einzige relevante Konkurrenz auf dem deutschen Markt ist ein Desktop-Tool aus den frühen 2000ern. Hier ist der direkte Vergleich.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-md border border-neutral-200 bg-bg-elevated">
          <table className="w-full text-sm">
            <thead className="bg-primary-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-[0.18em]">
                  Thema
                </th>
                <th className="px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-[0.18em]">
                  Strota
                </th>
                <th className="px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
                  Desktop-Lösung
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.topic}
                  className={i % 2 === 0 ? 'bg-bg-elevated' : 'bg-bg-subtle'}
                >
                  <td className="px-6 py-4 font-semibold text-primary-900">{row.topic}</td>
                  <td className="px-6 py-4 text-neutral-800">{row.strota}</td>
                  <td className="px-6 py-4 text-neutral-500 line-through decoration-neutral-300">
                    {row.desktop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          Vergleich gegen Desktop-Bauantragsanwendungen ohne KI, ohne Cloud, ohne Verfahrensbestimmungsengine. Quelle: Marktrecherche Q1 2026 (intern); aktualisiert wenn relevanter Konkurrent in den Markt eintritt.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Library teaser                                                             */
/* -------------------------------------------------------------------------- */

function LibraryTeaser(): JSX.Element {
  const entries = [
    { land: 'Bayern', doc: 'BayBO', title: 'Bayerische Bauordnung', year: 'Stand 2025' },
    { land: 'Bayern', doc: 'BauVorlV', title: 'Bauvorlagenverordnung Bayern', year: 'Stand 2025' },
    { land: 'Bayern', doc: 'DVO', title: 'Durchführungsverordnung zur BayBO', year: 'Stand 2025' },
    { land: 'München', doc: 'Satzung', title: 'Stellplatzsatzung der LHM', year: 'Stand 2024' },
    { land: 'Bayern', doc: 'Erlass', title: 'IMS-Erlass zu Solaranlagen', year: '2023' },
    { land: 'Bayern', doc: 'Hinweis', title: 'OBB-Hinweise zu Anbauten', year: '2024' },
  ];
  return (
    <section className="border-b border-neutral-200 bg-bg-subtle py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
            Strota Bibliothek
          </p>
          <h2 className="mt-3 font-display text-4xl text-primary-900 sm:text-5xl">
            Jede Entscheidung verlinkt die Rechtsquelle
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Volltext-Bibliothek über alle Landesbauordnungen, DVO, Erlasse und Gemeinde-Satzungen. Heute Bayern komplett. Jede Verfahrensbestimmung, jede Vollständigkeitsprüfung, jede Baubeschreibung trägt die zitierte Stelle direkt am Verdikt.
          </p>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <Link
              key={e.title}
              href="/bibliothek"
              className="group rounded-md border border-neutral-200 bg-bg-elevated p-5 transition-colors hover:border-primary-400"
            >
              <div className="flex items-center gap-2">
                <Badge tone="primary">{e.land}</Badge>
                <Badge tone="neutral">{e.doc}</Badge>
              </div>
              <p className="mt-3 font-display text-lg text-primary-900 group-hover:text-primary-700">
                {e.title}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
                {e.year}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href="/bibliothek"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Gesamte Bibliothek durchsuchen <span aria-hidden>›</span>
          </Link>
          <span className="text-xs text-neutral-500">
            Aktualisierung innerhalb 7 Werktagen nach Norm-Inkrafttreten.
          </span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Customer story (anonymized until real)                                     */
/* -------------------------------------------------------------------------- */

function CustomerStory(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-primary-900 py-24 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-400">
            Praxisbericht
          </p>
          <h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">
            Vom Vorab-Check bis zur Einreichung in einem Vormittag
          </h2>
          <p className="mt-4 text-base text-primary-100/85">
            Konkrete, namentlich freigegebene Praxisberichte erscheinen hier nach Abschluss der ersten Pilot-Verfahren. Die untenstehende Szene ist anonymisiert und illustriert ausschließlich die Strota-Logik; sie ist kein realer Kunde. Wir nennen niemals einen Kunden, den wir nicht haben.
          </p>
          <Link
            href="/ressourcen/blog"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-400 hover:text-white"
          >
            Zum Strota-Blog <span aria-hidden>›</span>
          </Link>
        </div>
        <figure className="rounded-md border border-primary-700 bg-primary-800 p-8 lg:p-10">
          <blockquote className="font-display text-2xl leading-snug text-white lg:text-3xl">
            &bdquo;Morgens die Genehmigungsfrei-Frage gekl&auml;rt, mittags Vollst&auml;ndigkeit gepr&uuml;ft, nachmittags qeS-signiert eingereicht. Vorher war das ein Vormittag pro Schritt.&ldquo;
          </blockquote>
          <figcaption className="mt-6 text-sm text-primary-100/75">
            Beispielhafte Strota-Erfahrung, anonymisiert. Echte Stimmen folgen nach Pilotabschluss.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Was bedeutet KI-nativ konkret?',
    a: 'Strota nutzt KI dort, wo sie deterministisch validierbare Ergebnisse liefert: Baubeschreibung generieren, Nachforderungs-Briefe analysieren, Q&A mit Norm-Zitat. Verfahrensbestimmung und Vollständigkeitsprüfer laufen regelbasiert über den Strota-Korpus, nicht über ein Sprachmodell. Jede KI-Antwort ist auf den Paragraphen zitiert und gegen die aktuelle Fassung der Norm geprüft.',
  },
  {
    q: 'Ersetzt Strota eine Architektin oder einen Bauingenieur?',
    a: 'Nein. Strota klärt das Verfahren, prüft Vollständigkeit, generiert die Baubeschreibung und führt zur Einreichung. Die fachliche Planung, Statik und Bauvorlageberechtigung bleiben bei Ihrer Architektin oder Ihrem Ingenieurbüro. Jede KI-Antwort hat ein „Architekt prüft und entscheidet"-Gate.',
  },
  {
    q: 'Ist Strota mit RDG vereinbar?',
    a: 'Strota gibt keine Rechtsberatung im Sinne des RDG. Strota Fragt beantwortet ausschließlich abstrakte regulatorische Fragen und routet konkrete Sachverhalte an „bitte Architekt oder Anwalt konsultieren". Das Gutachten zur RDG-Compliance wurde in Phase 2 erstellt (ADR-0021).',
  },
  {
    q: 'Wo werden meine Daten gehostet?',
    a: 'In Deutschland, auf Hetzner CCX53 in Falkenstein und Nürnberg. Keine Datenweitergabe in Drittstaaten. Keine Verwendung Ihrer Auftragsdaten für KI-Training, weder durch Strota noch durch Sub-Processor (AVV §8 Abs. 4).',
  },
  {
    q: 'Wann unterstützt Strota mein Bundesland?',
    a: 'Bayern ist live. Baden-Württemberg, Hessen, Niedersachsen und Nordrhein-Westfalen folgen Q3 2026, weitere Länder bis H1 2027. Die vollständige Roadmap ist öffentlich und pro Bundesland mit Datum dokumentiert.',
  },
  {
    q: 'Was kostet Strota?',
    a: 'Genehmigungsfrei-Prüfer, Strota Fragt und 1 Dokument-Analyse sind dauerhaft kostenlos ohne Konto. Freiberufler 29 EUR/Monat. Büro (2 bis 15 Sitze) 79 EUR/Monat. Bauträger 299 EUR/Monat mit REST-API und XBau-Submit. Strota Kommune nach Verhandlung. 14-Tage-Trial ohne Kreditkarte.',
  },
  {
    q: 'Wie aktuell sind die Rechtsquellen?',
    a: 'Wir aktualisieren Bundes- und Landesrecht innerhalb von 7 Werktagen nach Inkrafttreten. Änderungen werden in der Bibliothek mit Diff sichtbar gemacht. Jede Strota-Entscheidung trägt die Korpus-Version und die Norm-Effective-Date am Verdikt.',
  },
];

function FAQ(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-bg-base py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
            Häufige Fragen
          </p>
          <h2 className="mt-3 font-display text-4xl text-primary-900 sm:text-5xl">
            Bauantragsrecht ohne Geheimnisse
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Weitere Fragen? Schreiben Sie uns direkt. Antwort in der Regel innerhalb 24 Stunden.
          </p>
          <Link
            href="mailto:hallo@strota.de"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            hallo@strota.de <span aria-hidden>›</span>
          </Link>
        </div>
        <div className="space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-md border border-neutral-200 bg-bg-elevated p-5 open:bg-primary-50"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="font-display text-lg text-primary-900">{item.q}</span>
                <span
                  aria-hidden
                  className="mt-1 text-xl text-primary-500 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                */
/* -------------------------------------------------------------------------- */

function ClosingCTA(): JSX.Element {
  return (
    <section className="bg-primary-900 py-24 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-400">
          Loslegen
        </p>
        <h2 className="mt-3 font-display text-5xl text-white sm:text-6xl">
          Kein Nachfordern mehr.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-100/90">
          Starten Sie kostenlos mit dem Genehmigungsfrei-Prüfer oder testen Sie 14 Tage die volle Plattform. Keine Kreditkarte, kein Abo, kein Newsletter-Zwang.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" variant="accent">
              14 Tage kostenlos testen
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              size="lg"
              variant="secondary"
              className="border-primary-700 bg-primary-800 text-white hover:bg-primary-700"
            >
              Demo buchen
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-primary-100/70">
          KI-nativ · DSGVO + BDSG · Hosting in Deutschland · Keine Auftragsdaten für KI-Training (AVV §8 Abs. 4)
        </p>
      </div>
    </section>
  );
}
