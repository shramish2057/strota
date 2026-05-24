import { Badge, Button, Container } from '@strota/ui';
import Link from 'next/link';
import { GenehmigungsfreiHeroForm } from '../../components/home/genehmigungsfrei-hero-form';
import { SoftwareApplicationJsonLd } from '../../components/seo/json-ld';

/**
 * Strota homepage per v5.0 Bible Part 2.7. Interactive Genehmigungsfrei-Pruefer
 * hero (real check goes live Phase 3.5; Phase 3 shows the form + a placeholder
 * 'coming soon' inline message). Three entry points below the fold.
 *
 * Trust row only renders Bayern badge initially; expanded after Phase 18 corpus
 * milestones. UWG-konform per docs/legal/uwg-belege/.
 */
export default function HomePage(): JSX.Element {
  return (
    <>
      <SoftwareApplicationJsonLd />
      <Hero />
      <TrustRow />
      <EntryPoints />
      <FooterCta />
    </>
  );
}

function Hero(): JSX.Element {
  return (
    <section className="grid min-h-[640px] grid-cols-1 md:grid-cols-5">
      <div className="flex flex-col justify-center bg-primary-800 px-6 py-14 text-white md:col-span-2 md:px-12">
        <p className="font-mono text-xs uppercase tracking-widest text-primary-100/80">
          Genehmigungsfrei-Prüfer
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
          Brauchen Sie einen Bauantrag?
        </h1>
        <p className="mt-4 text-base text-primary-100/90 md:text-lg">
          Adresse eingeben und in 30 Sekunden erfahren, welches
          Genehmigungsverfahren gilt.
        </p>
        <p className="mt-8 text-xs text-primary-100/70">
          Kein Konto erforderlich. Datenminimal nach DSGVO Art. 5.
        </p>
      </div>
      <div className="flex flex-col justify-center bg-bg-subtle px-6 py-14 md:col-span-3 md:px-12">
        <GenehmigungsfreiHeroForm />
      </div>
    </section>
  );
}

function TrustRow(): JSX.Element {
  return (
    <section
      aria-label="Vertrauen"
      className="border-y border-neutral-200 bg-bg-elevated"
    >
      <Container className="flex flex-wrap items-center justify-center gap-3 py-6 text-sm text-neutral-700">
        <Badge tone="success">Bayern verfügbar</Badge>
        <span className="text-neutral-300">·</span>
        <span>NRW + BW in Vorbereitung (Phase 18)</span>
        <span className="text-neutral-300">·</span>
        <span>Geprüft von Architekten (ab Phase 11)</span>
        <span className="text-neutral-300">·</span>
        <span>Datenresidenz EU-Frankfurt</span>
      </Container>
    </section>
  );
}

function EntryPoints(): JSX.Element {
  const entries = [
    {
      href: '/',
      label: 'Kostenlos',
      title: 'Genehmigungsfrei-Prüfer',
      body: 'Brauche ich einen Antrag?',
      cta: 'Oben prüfen',
    },
    {
      href: '/signup',
      label: '14 Tage testen',
      title: 'Unterlagenliste erstellen',
      body: 'Was muss ich einreichen?',
      cta: '14 Tage testen',
    },
    {
      href: '/signup',
      label: 'Hochladen',
      title: 'Dokument analysieren',
      body: 'Was bedeutet dieser Brief?',
      cta: 'Hochladen',
    },
  ];
  return (
    <section aria-label="Drei Einstiege" className="bg-bg-base py-16">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.title}
              href={entry.href}
              className="group flex flex-col gap-3 rounded-md border border-neutral-200 bg-bg-elevated p-6 transition-colors hover:border-primary-400 hover:bg-primary-50/30"
            >
              <Badge tone="primary">{entry.label}</Badge>
              <h3 className="font-display text-xl text-primary-900">{entry.title}</h3>
              <p className="text-sm text-neutral-700">{entry.body}</p>
              <span className="mt-auto text-sm font-semibold text-primary-700 group-hover:underline">
                {entry.cta} →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FooterCta(): JSX.Element {
  return (
    <section className="bg-primary-900 py-16 text-white">
      <Container className="text-center">
        <h2 className="font-display text-3xl md:text-4xl">
          Bauanträge vorbereiten, die beim ersten Mal genehmigt werden.
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button variant="accent" size="lg">
              14 Tage kostenlos testen
            </Button>
          </Link>
          <span className="text-sm text-primary-100/80">Keine Kreditkarte erforderlich.</span>
        </div>
      </Container>
    </section>
  );
}
