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
      <LibraryTeaser />
      <TrustWall />
      <CustomerStory />
      <FAQ />
      <ClosingCTA />
    </>
  );
}

function Hero(): JSX.Element {
  return (
    <section className="relative isolate overflow-hidden border-b border-neutral-200">
      <HeroVideo />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-900/95 via-primary-900/80 to-primary-900/40"
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2">
            <Badge tone="primary">Bayern Live</Badge>
            <Badge tone="accent">DACH Roadmap 2026/27</Badge>
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.04] sm:text-6xl">
            Bauanträge, vollständig bevor sie eingereicht werden.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-100/90">
            Strota klärt in 60 Sekunden, ob Ihr Vorhaben überhaupt einen Antrag braucht, welches Verfahren greift und welche Pflichtnachweise fehlen. Heute live in Bayern, Bundesland für Bundesland im Ausbau.
          </p>
          <div className="mt-8 max-w-xl">
            <GenehmigungsfreiHeroForm />
          </div>
          <p className="mt-4 text-xs text-primary-100/70">
            Kein Konto nötig. Wir speichern die Adresse nicht ohne Ihre Zustimmung. DSGVO &amp; BDSG, Hosting in Deutschland.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatsRow(): JSX.Element {
  const stats = [
    { headline: '1 Bundesland live', sub: 'Bayern, mit kompletter BayBO + BauVorlV + DVO' },
    { headline: '60 Sekunden', sub: 'für eine belastbare Verfahrensbestimmung' },
    { headline: '100 % DSGVO', sub: 'Hosting in Deutschland, kein KI-Training auf Auftragsdaten' },
  ];
  return (
    <section className="border-b border-neutral-200 bg-bg-subtle">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 lg:px-8">
        {stats.map((s) => (
          <div key={s.headline} className="text-center sm:text-left">
            <p className="font-display text-3xl text-primary-900 sm:text-4xl">{s.headline}</p>
            <p className="mt-2 text-sm text-neutral-700">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const PILLARS = [
  {
    eyebrow: 'Planen',
    title: 'Neubau und Erstprojekte',
    body:
      'Von der ersten Standortfrage bis zur qeS-signierten Einreichung. Verfahren bestimmen, Pflichtnachweise klären, Vollständigkeit garantieren.',
    bullets: [
      'Genehmigungsfrei-Prüfer (BayBO Art. 57)',
      'Vereinfacht / Voll / Genehmigungsfrei deterministisch entschieden',
      'Vollständigkeits-Check gegen BauVorlV',
      'qeS-Einreichung (eIDAS)',
    ],
    cta: { label: 'Mehr zu Planen', href: '/planen' },
    accentClass: 'bg-primary-700 text-white',
    cardClass: 'bg-primary-50',
  },
  {
    eyebrow: 'Sanieren',
    title: 'Bestand, Energie, Denkmal',
    body:
      'Sanierungspflichten klar beantwortet. GEG, Denkmalschutz, Förderprogramme: aufeinander abgestimmt geprüft, bevor Sie Geld in den Sand setzen.',
    bullets: [
      'GEG-Sanierungspflicht-Check',
      'Denkmalschutz- und Ensemble-Hinweise',
      'Energieausweis-Klärung',
      'Förderprogramm-Finder (BEG, KfW, Länder)',
    ],
    cta: { label: 'Mehr zu Sanieren', href: '/sanieren' },
    accentClass: 'bg-accent-500 text-primary-900',
    cardClass: 'bg-bg-elevated',
  },
  {
    eyebrow: 'Umbauen',
    title: 'Anbau, Aufstockung, Nutzungsänderung',
    body:
      'Bestehende Gebäude weiterdenken. Klärung, ob überhaupt ein Antrag nötig wird, welche Auflagen greifen, welche Nachweise fehlen.',
    bullets: [
      'Nutzungsänderung-Prüfer (BauO + BauNVO)',
      'Anbau- und Aufstockungs-Check',
      'Brandschutz-Anforderungen (F-90, Rettungswege)',
      'Statik-Voranzeige',
    ],
    cta: { label: 'Mehr zu Umbauen', href: '/umbauen' },
    accentClass: 'bg-primary-900 text-white',
    cardClass: 'bg-bg-elevated',
  },
];

function ThreePillars(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-bg-base py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            Drei Lebenszyklen
          </p>
          <h2 className="mt-2 font-display text-4xl text-primary-900">
            Planen. Sanieren. Umbauen.
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Bauantragsrecht in Deutschland ist nicht ein Thema, sondern drei. Strota deckt alle drei deterministisch ab, jeweils mit derselben Rechtsgrundlage, demselben Prüfschema, derselben Dokumenten-Logik.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <Card key={p.eyebrow} className={p.cardClass}>
              <CardHeader>
                <div
                  className={`inline-flex w-fit items-center rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${p.accentClass}`}
                >
                  {p.eyebrow}
                </div>
                <CardTitle className="mt-3 font-display text-2xl text-primary-900">{p.title}</CardTitle>
                <CardDescription className="mt-2 text-neutral-700">{p.body}</CardDescription>
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

function HowItWorks(): JSX.Element {
  const steps = [
    {
      n: '01',
      title: 'Adresse + Vorhaben eingeben',
      body: 'Geokodierung gegen den BKG-Datenbestand, Vorhaben-Klassifikation nach BayBO-Schema.',
    },
    {
      n: '02',
      title: 'Verfahren wird deterministisch bestimmt',
      body: 'Regel-Engine über BayBO Art. 57, 58, 59 plus DVO BayBO. Jede Begründung verlinkt die Rechtsquelle.',
    },
    {
      n: '03',
      title: 'Pflichtnachweise sammeln, qeS einreichen',
      body: 'Upload-Checklisten, Plausibilitäts-Check, qeS-Signatur, Übergabe an die Gemeinde.',
    },
  ];
  return (
    <section className="border-b border-neutral-200 bg-bg-subtle py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
              So funktioniert es
            </p>
            <h2 className="mt-2 font-display text-4xl text-primary-900">
              Drei Schritte, keine Überraschungen
            </h2>
            <p className="mt-4 text-base text-neutral-700">
              Kein Wartezimmer, keine Voranfragen, keine Excel-Tabellen. Strota führt durch das Verfahren wie ein erfahrener Bauantrags-Manager: Schritt für Schritt, mit Quellenangabe.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Selbst ausprobieren <span aria-hidden>›</span>
            </Link>
          </div>
          <ol className="space-y-6">
            {steps.map((s) => (
              <li key={s.n} className="grid grid-cols-[3rem_1fr] items-start gap-4 rounded-md border border-neutral-200 bg-bg-elevated p-6">
                <div className="font-mono text-3xl text-primary-500">{s.n}</div>
                <div>
                  <h3 className="font-display text-xl text-primary-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-neutral-700">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

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
    <section className="border-b border-neutral-200 bg-bg-base py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            BauO-Bibliothek
          </p>
          <h2 className="mt-2 font-display text-4xl text-primary-900">
            Jede Antwort verlinkt eine Rechtsquelle
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Volltext-Bibliothek über Landesbauordnungen, DVO und Satzungen. Heute Bayern komplett, weitere Bundesländer entlang der Roadmap. Jede Strota-Entscheidung trägt die zitierte Quelle direkt am Verdikt.
          </p>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <Link
              key={e.title}
              href="/ressourcen/bibliothek"
              className="group rounded-md border border-neutral-200 bg-bg-elevated p-5 transition-colors hover:border-primary-400"
            >
              <div className="flex items-center gap-2">
                <Badge tone="primary">{e.land}</Badge>
                <Badge tone="neutral">{e.doc}</Badge>
              </div>
              <p className="mt-3 font-display text-lg text-primary-900 group-hover:text-primary-700">
                {e.title}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-neutral-500">
                {e.year}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/ressourcen/bibliothek"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Gesamte Bibliothek durchsuchen <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustWall(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-bg-subtle py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
          Vertrauen entsteht durch Belege
        </p>
        <h2 className="mt-3 text-center font-display text-2xl text-primary-900">
          Unsere Partner und Pilotpraxen werden hier sichtbar
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-neutral-700">
          Strota tritt heute mit drei Pilot-Architekturbüros und einem bayerischen Landratsamt in den Live-Betrieb. Logos und Zitate werden hier veröffentlicht, sobald die Pilotphase abgeschlossen und die Freigaben erteilt sind. Wir nennen niemals einen Kunden, den wir nicht haben.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-16 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-bg-elevated text-xs text-neutral-400"
            >
              Pilot-Logo {i + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomerStory(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-primary-900 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-400">
            Praxisbericht
          </p>
          <h2 className="mt-2 font-display text-4xl text-white">
            Vom Vorab-Check bis zur Einreichung in einem Vormittag
          </h2>
          <p className="mt-4 text-base text-primary-100/90">
            Wir veröffentlichen hier konkrete, namentlich freigegebene Praxisberichte aus unseren Pilotbüros, sobald die ersten Verfahren durchgelaufen sind. Die hier gezeigte Beispielsituation ist anonymisiert und dient ausschließlich der Veranschaulichung der Strota-Logik. Keine echten Personenangaben.
          </p>
          <Link
            href="/ressourcen/blog"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-400 hover:text-white"
          >
            Zum Strota-Blog <span aria-hidden>›</span>
          </Link>
        </div>
        <figure className="rounded-md border border-primary-700 bg-primary-800 p-8">
          <blockquote className="font-display text-2xl leading-snug text-white">
            „Wir hatten morgens die Genehmigungsfrei-Frage geklärt, mittags die Vollständigkeit geprüft und nachmittags qeS-signiert eingereicht. Vorher war das ein Vormittag pro Schritt.“
          </blockquote>
          <figcaption className="mt-6 text-sm text-primary-100/80">
            Beispielhafte Strota-Erfahrung, anonymisiert. Echte Stimmen folgen nach Pilotabschluss.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Ersetzt Strota eine Architektin oder einen Bauingenieur?',
    a: 'Nein. Strota klärt das Verfahren, prüft Vollständigkeit und führt zur Einreichung. Die fachliche Planung, Statik und Bauvorlageberechtigung bleiben bei Ihrer Architektin oder Ihrem Ingenieurbüro.',
  },
  {
    q: 'Ist Strota mit RDG vereinbar? Geben Sie Rechtsberatung?',
    a: 'Strota gibt keine Rechtsberatung im Sinne des RDG. Wir liefern eine deterministische, regelbasierte Verfahrensbestimmung mit verlinkten Rechtsquellen. Eine individuelle Rechtsberatung erfolgt durch Anwältinnen oder Architektenkammern, wenn sie nötig ist.',
  },
  {
    q: 'Wo werden meine Daten gehostet?',
    a: 'In Deutschland, auf Hetzner CCX53 in Falkenstein und Nürnberg. Keine Datenweitergabe in Drittstaaten. Keine Verwendung Ihrer Auftragsdaten für KI-Training. Details in der AVV §8 Abs. 4 und in unserer Datenschutzerklärung.',
  },
  {
    q: 'Wann unterstützt Strota mein Bundesland?',
    a: 'Bayern ist live. Baden-Württemberg, Hessen, Niedersachsen und Nordrhein-Westfalen folgen Q3 2026, weitere Länder bis H1 2027. Die vollständige Roadmap ist öffentlich.',
  },
  {
    q: 'Wie aktuell sind die Rechtsquellen?',
    a: 'Wir aktualisieren Bundes- und Landesrecht innerhalb von 7 Werktagen nach Inkrafttreten. Änderungen werden in der Bibliothek mit Diff sichtbar gemacht.',
  },
  {
    q: 'Was kostet Strota?',
    a: 'Der Genehmigungsfrei-Prüfer ist dauerhaft kostenlos. Für die professionelle Nutzung (Mehrfach-Projekte, Behördenschnittstelle, qeS) gibt es transparente Monatspläne. Details unter Preise.',
  },
];

function FAQ(): JSX.Element {
  return (
    <section className="border-b border-neutral-200 bg-bg-base py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            Häufige Fragen
          </p>
          <h2 className="mt-2 font-display text-4xl text-primary-900">
            Bauantragsrecht ohne Geheimnisse
          </h2>
          <p className="mt-4 text-base text-neutral-700">
            Sie haben weiterhin Fragen? Schreiben Sie uns direkt, wir antworten in der Regel innerhalb von 24 Stunden.
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
                <span aria-hidden className="mt-1 text-xl text-primary-500 transition-transform group-open:rotate-45">
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

function ClosingCTA(): JSX.Element {
  return (
    <section className="bg-primary-900 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-primary-400">
          Loslegen
        </p>
        <h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">
          Bauanträge, die beim ersten Mal vollständig sind.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-primary-100/85">
          Starten Sie kostenlos mit dem Genehmigungsfrei-Prüfer. Keine Kreditkarte, kein Abo, kein Newsletter-Zwang. Konto in 60 Sekunden, jederzeit löschbar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" variant="accent">
              Kostenlos starten
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="secondary" className="border-primary-700 bg-primary-800 text-white hover:bg-primary-700">
              Demo buchen
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-primary-100/70">
          Hosted in Deutschland · DSGVO + BDSG · Keine Auftragsdaten für KI-Training (AVV §8 Abs. 4)
        </p>
      </div>
    </section>
  );
}
