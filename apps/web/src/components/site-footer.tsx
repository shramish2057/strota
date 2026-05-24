import Link from 'next/link';

/**
 * Site footer with all Pflicht-Links per TMG §5 + DSGVO + cookie/AVV.
 * Rendered on every public route so Impressum/Datenschutz are one click away.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-neutral-200 bg-bg-subtle">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-display text-lg text-primary-900">Strota</p>
            <p className="mt-2 text-sm text-neutral-700">
              Bauanträge. Schneller. Vollständig. Eingereicht.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Recht
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:underline" href="/impressum">
                  Impressum
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/datenschutz">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/cookies">
                  Cookie-Erklärung
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/avv">
                  AVV-Vorlage
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Compliance
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:underline" href="/toms">
                  Technische Maßnahmen
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/sub-processors">
                  Sub-Processor-Liste
                </Link>
              </li>
              <li>
                <a className="hover:underline" href="mailto:datenschutz@strota.de">
                  Betroffenenrechte
                </a>
              </li>
              <li>
                <a className="hover:underline" href="mailto:security@strota.de">
                  Security-Disclosure
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Status
            </h3>
            <p className="mt-3 text-sm text-neutral-700">
              Plattform im Aufbau. Genehmigungsfrei-Prüfer geht Phase 3.5 live.
            </p>
            <p className="mt-3 text-xs text-neutral-500">
              Strota (in Gründung), Deutschland.
            </p>
          </div>
        </div>
        <p className="mt-12 text-xs text-neutral-500">
          © {new Date().getFullYear()} Strota. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
