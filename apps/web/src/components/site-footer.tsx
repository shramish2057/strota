import Link from 'next/link';
import { Badge } from '@strota/ui';
import { StrotaWordmark } from './site-nav/wordmark';

/**
 * Strota fat footer. DACH positioning (DE/AT/CH), 16 Bundeslaender named
 * explicitly with rollout status, plus all TMG/DSGVO Pflichtangaben.
 *
 * Status discipline: only Bayern says "Live". All others say a roadmap quarter
 * we can credibly hit and would defend in front of a UWG lawyer.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer className="mt-24 border-t border-neutral-200 bg-bg-subtle text-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <NewsletterPanel />
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <BrandColumn />
          <LinkColumns />
        </div>
        <CoveragePanel />
        <BottomBar />
      </div>
    </footer>
  );
}

function NewsletterPanel(): JSX.Element {
  return (
    <div className="grid items-center gap-6 rounded-md border border-neutral-200 bg-bg-elevated px-6 py-8 md:grid-cols-[1.4fr_1fr] md:px-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
          Newsletter
        </p>
        <h2 className="mt-2 font-display text-2xl text-primary-900">
          Bauantragsrecht, ohne Geschwafel.
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          Monatliche Updates zu BayBO, BauVorlV, DVO und Satzungen. Keine PR, keine Verkaufsmails. Abmelden mit einem Klick.
        </p>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        action="https://example.invalid/newsletter"
        method="post"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          E-Mail-Adresse
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="ihre.adresse@kanzlei.de"
          className="flex-1 rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        />
        <button
          type="submit"
          className="rounded-sm bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
        >
          Abonnieren
        </button>
      </form>
    </div>
  );
}

function BrandColumn(): JSX.Element {
  return (
    <div>
      <StrotaWordmark className="h-8 w-auto text-primary-900" />
      <p className="mt-4 max-w-sm text-sm text-neutral-700">
        Strota ist die DACH-Plattform für Bauanträge. Verfahren bestimmen, Unterlagen prüfen, qeS-signiert einreichen. Aufgebaut in Deutschland, gehostet in Deutschland.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="primary">Made in DACH</Badge>
        <Badge tone="success">Bayern Live</Badge>
        <Badge tone="neutral">DSGVO &amp; BDSG</Badge>
      </div>
      <p className="mt-6 text-xs text-neutral-500">
        Strota (in Gründung)
        <br />
        Adresse folgt nach Eintragung HRB
        <br />
        E-Mail:{' '}
        <a className="underline hover:text-primary-700" href="mailto:hallo@strota.de">
          hallo@strota.de
        </a>
      </p>
    </div>
  );
}

type LinkSection = { heading: string; links: { label: string; href: string }[] };

const PRODUCT_COLUMNS: LinkSection[] = [
  {
    heading: 'Planen',
    links: [
      { label: 'Genehmigungsfrei-Prüfer', href: '/planen/genehmigungsfrei' },
      { label: 'Verfahrensbestimmung', href: '/planen/verfahren' },
      { label: 'Vollständigkeitsprüfung', href: '/planen/vollstaendigkeit' },
      { label: 'Dokument-Analyse', href: '/planen/analyse' },
      { label: 'qeS-Einreichung', href: '/planen/qes' },
    ],
  },
  {
    heading: 'Sanieren',
    links: [
      { label: 'GEG-Sanierungspflicht', href: '/sanieren/geg' },
      { label: 'Denkmalschutz', href: '/sanieren/denkmal' },
      { label: 'Förderprogramm-Finder', href: '/sanieren/foerderung' },
      { label: 'Energieausweis', href: '/sanieren/energieausweis' },
    ],
  },
  {
    heading: 'Umbauen',
    links: [
      { label: 'Nutzungsänderung', href: '/umbauen/nutzungsaenderung' },
      { label: 'Anbau / Aufstockung', href: '/umbauen/anbau' },
      { label: 'Brandschutz', href: '/umbauen/brandschutz' },
      { label: 'Statik-Voranzeige', href: '/umbauen/statik' },
    ],
  },
  {
    heading: 'Für wen',
    links: [
      { label: 'Architekt:innen', href: '/zielgruppen/architekten' },
      { label: 'Bauträger', href: '/zielgruppen/bautraeger' },
      { label: 'Planungsbüros', href: '/zielgruppen/planungsbueros' },
      { label: 'Behörden', href: '/zielgruppen/behoerden' },
      { label: 'Bauherr:innen', href: '/zielgruppen/bauherren' },
    ],
  },
  {
    heading: 'Ressourcen',
    links: [
      { label: 'Blog', href: '/ressourcen/blog' },
      { label: 'BauO-Bibliothek', href: '/ressourcen/bibliothek' },
      { label: 'Vorlagen', href: '/ressourcen/vorlagen' },
      { label: 'Webinare', href: '/ressourcen/webinare' },
      { label: 'Roadmap', href: '/ressourcen/roadmap' },
    ],
  },
  {
    heading: 'Unternehmen',
    links: [
      { label: 'Über uns', href: '/ueber-uns' },
      { label: 'Kontakt', href: '/kontakt' },
      { label: 'Karriere', href: '/karriere' },
      { label: 'Presse', href: '/presse' },
      { label: 'Status', href: '/status' },
    ],
  },
];

function LinkColumns(): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
      {PRODUCT_COLUMNS.map((section) => (
        <div key={section.heading}>
          <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {section.heading}
          </h3>
          <ul className="mt-3 space-y-2">
            {section.links.map((link) => (
              <li key={link.href}>
                <Link
                  className="text-sm text-neutral-700 transition-colors hover:text-primary-700"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type BundeslandStatus = 'Live' | 'Q3 2026' | 'Q4 2026' | 'H1 2027';

const BUNDESLAENDER: { name: string; status: BundeslandStatus }[] = [
  { name: 'Baden-Württemberg', status: 'Q3 2026' },
  { name: 'Bayern', status: 'Live' },
  { name: 'Berlin', status: 'Q4 2026' },
  { name: 'Brandenburg', status: 'Q4 2026' },
  { name: 'Bremen', status: 'H1 2027' },
  { name: 'Hamburg', status: 'Q4 2026' },
  { name: 'Hessen', status: 'Q3 2026' },
  { name: 'Mecklenburg-Vorpommern', status: 'H1 2027' },
  { name: 'Niedersachsen', status: 'Q3 2026' },
  { name: 'Nordrhein-Westfalen', status: 'Q3 2026' },
  { name: 'Rheinland-Pfalz', status: 'Q4 2026' },
  { name: 'Saarland', status: 'H1 2027' },
  { name: 'Sachsen', status: 'Q4 2026' },
  { name: 'Sachsen-Anhalt', status: 'H1 2027' },
  { name: 'Schleswig-Holstein', status: 'Q4 2026' },
  { name: 'Thüringen', status: 'H1 2027' },
];

const DACH_REGIONS: { name: string; status: BundeslandStatus | 'Vorbereitung' }[] = [
  { name: 'Österreich', status: 'Vorbereitung' },
  { name: 'Schweiz', status: 'Vorbereitung' },
];

function CoveragePanel(): JSX.Element {
  return (
    <section
      aria-labelledby="footer-coverage-heading"
      className="mt-16 rounded-md border border-neutral-200 bg-bg-elevated p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            Abdeckung
          </p>
          <h2 id="footer-coverage-heading" className="mt-1 font-display text-2xl text-primary-900">
            Bauantrags-Plattform für die gesamte DACH-Region
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-700">
            Wir bauen Bundesland für Bundesland aus. Bayern ist heute live, alle weiteren Länder folgen entlang einer öffentlich dokumentierten Roadmap.
          </p>
        </div>
        <Link
          className="text-sm font-semibold text-primary-700 hover:text-primary-800"
          href="/ressourcen/roadmap"
        >
          Vollständige Roadmap →
        </Link>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Deutschland · 16 Bundesländer
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDESLAENDER.map((bl) => (
              <li
                key={bl.name}
                className="flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-bg-base px-3 py-2 text-sm"
              >
                <span className="font-medium text-neutral-900">{bl.name}</span>
                <StatusPill status={bl.status} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            DACH gesamt
          </h3>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-bg-base px-3 py-2 text-sm">
              <span className="font-medium text-neutral-900">Deutschland</span>
              <StatusPill status="Live" />
            </li>
            {DACH_REGIONS.map((region) => (
              <li
                key={region.name}
                className="flex items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-bg-base px-3 py-2 text-sm"
              >
                <span className="font-medium text-neutral-900">{region.name}</span>
                <StatusPill status={region.status} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500">
            Bauordnungsrecht in AT und CH unterscheidet sich strukturell von Deutschland. Wir starten dort erst, wenn wir genauso seriös liefern können wie in Bayern.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: BundeslandStatus | 'Vorbereitung' }): JSX.Element {
  const tone =
    status === 'Live'
      ? 'success'
      : status === 'Q3 2026'
        ? 'primary'
        : status === 'Q4 2026'
          ? 'warning'
          : 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}

function BottomBar(): JSX.Element {
  return (
    <div className="mt-16 border-t border-neutral-200 pt-8">
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Pflichtangaben
          </h3>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
            <li>
              <Link href="/impressum" className="hover:text-primary-700">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="hover:text-primary-700">
                Datenschutzerklärung
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-primary-700">
                Cookie-Erklärung
              </Link>
            </li>
            <li>
              <Link href="/agb" className="hover:text-primary-700">
                AGB
              </Link>
            </li>
            <li>
              <Link href="/avv" className="hover:text-primary-700">
                AVV-Vorlage
              </Link>
            </li>
            <li>
              <Link href="/toms" className="hover:text-primary-700">
                Technische Maßnahmen
              </Link>
            </li>
            <li>
              <Link href="/sub-processors" className="hover:text-primary-700">
                Sub-Processoren
              </Link>
            </li>
            <li>
              <a
                className="hover:text-primary-700"
                href="mailto:datenschutz@strota.de"
              >
                Betroffenenrechte
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-1 rounded-sm border border-neutral-200 bg-bg-elevated px-2 py-1 font-mono text-xs uppercase">
            <span className="font-semibold text-primary-700">DE</span>
            <span aria-hidden className="text-neutral-300">
              |
            </span>
            <Link href="/?lang=en" className="hover:text-primary-700">
              EN
            </Link>
          </div>
          <a
            href="https://www.linkedin.com/company/strota"
            target="_blank"
            rel="me noreferrer"
            className="hover:text-primary-700"
          >
            LinkedIn
          </a>
        </div>
      </div>
      <p className="mt-8 text-xs text-neutral-500">
        © {new Date().getFullYear()} Strota. Hosted in Deutschland · DSGVO und BDSG konform · Keine Auftragsdaten für KI-Training (siehe AVV §8 Abs. 4).
      </p>
    </div>
  );
}
