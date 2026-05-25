import type { Metadata } from 'next';
import { GrzRechnerForm } from './grz-rechner-form';

export const metadata: Metadata = {
  title: 'GRZ- und GFZ-Rechner | Strota',
  description:
    'Kostenlos Grundflaechenzahl (GRZ) und Geschossflaechenzahl (GFZ) berechnen und gegen B-Plan-Festsetzungen pruefen. Quelle BauNVO §§17, 19, 20.',
  alternates: { canonical: '/grz-rechner' },
};

export default function GrzRechnerPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-24">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
        Kostenloser Werkzeug
      </p>
      <h1 className="mt-3 font-display text-5xl text-primary-900 sm:text-6xl">
        GRZ- und GFZ-Rechner
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-700">
        Grundflaechenzahl und Geschossflaechenzahl pro Grundstueck berechnen und gegen die
        Festsetzungen Ihres Bebauungsplans pruefen. Rechtsgrundlage §§ 17, 19, 20 BauNVO.
        Kein Konto noetig.
      </p>
      <div className="mt-10">
        <GrzRechnerForm />
      </div>
    </main>
  );
}
