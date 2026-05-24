'use client';

import { Button, Field, Input } from '@strota/ui';
import Link from 'next/link';
import { useState } from 'react';

const PROJECT_TYPES = [
  'Terrassenüberdachung',
  'Garage / Carport',
  'Gartenhütte / Schuppen',
  'Solaranlage / PV',
  'Neubau Wohngebäude',
  'Anbau / Erweiterung',
  'Umbau innen',
  'Nutzungsänderung',
  'Abbruch',
];

/**
 * Genehmigungsfrei-Prüfer hero form. Phase 3 ships the UI; the deterministic
 * verdict engine + 5 verdicts goes live in Phase 3.5 (per v5.0 Bible).
 *
 * On submit in Phase 3 we redirect to /signup with a hint so the lead funnel
 * is captured even before the engine is live.
 */
export function GenehmigungsfreiHeroForm(): JSX.Element {
  const [submitted, setSubmitted] = useState(false);
  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-primary-200 bg-bg-elevated p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Phase 3 Vorschau
        </p>
        <h2 className="mt-3 font-display text-2xl text-primary-900">
          Genehmigungsfrei-Prüfer geht Phase 3.5 live
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          Bis dahin nehmen Sie sich 60 Sekunden für einen Konto-Account und wir
          benachrichtigen Sie, sobald der Prüfer freigeschaltet ist.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/signup">
            <Button>Konto anlegen</Button>
          </Link>
          <Button variant="secondary" type="button" onClick={() => setSubmitted(false)}>
            Andere Adresse prüfen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md bg-bg-elevated p-6 shadow-sm">
      <Field label="Adresse" htmlFor="hero-address" hint="Straße und Hausnummer plus Postleitzahl">
        <Input
          id="hero-address"
          name="address"
          required
          placeholder="Musterstraße 12, 80539 München"
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <Field label="Projekttyp" htmlFor="hero-project-type">
        <select
          id="hero-project-type"
          name="project_type"
          required
          className="block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <option value="">Bitte wählen ...</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" size="lg" className="w-full">
        Kostenlos prüfen
      </Button>
      <p className="text-xs text-neutral-500">
        Beispiele: Terrassenüberdachung · Garage · Neubau EFH · Anbau
      </p>
    </form>
  );
}
