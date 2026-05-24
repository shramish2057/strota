import type { Metadata } from 'next';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ScoreRing, StatusDot } from '@strota/ui';
import { fetchCurrentUser } from '../../lib/auth-server';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function AppDashboardPage(): Promise<JSX.Element> {
  const user = await fetchCurrentUser();
  if (!user) return <></>;
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Phase 3 Foundation</p>
        <h1 className="font-display text-3xl text-primary-900">
          Willkommen zurück, {user.full_name ?? user.email}
        </h1>
        <p className="text-neutral-700">
          Sobald Sie das erste Projekt anlegen, erscheinen hier Ihre offenen Aufgaben.
          Die Projekt-Anlage geht in Phase 5 live.
        </p>
      </header>

      <section aria-labelledby="placeholder-projects" className="space-y-4">
        <h2 id="placeholder-projects" className="font-display text-xl text-primary-900">
          Beispiel-Projekte (Vorschau)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PreviewProjectCard
            title="Neubau EFH Musterstraße 12"
            location="München, Bayern · GK2"
            verfahren="Vereinfachtes Verfahren"
            verfahrenTone="primary"
            score={88}
            status="warning"
            statusLabel="Vollständigkeitsprüfung läuft"
          />
          <PreviewProjectCard
            title="Anbau Carport Musterweg 7"
            location="Unterschleißheim, Bayern · GK1"
            verfahren="Verfahrensfrei"
            verfahrenTone="success"
            score={100}
            status="success"
            statusLabel="Bereit zur Einreichung"
          />
          <PreviewProjectCard
            title="Neubau Kita Erlangen"
            location="Erlangen, Bayern · GK3 · Sonderbau"
            verfahren="Sonderbauverfahren"
            verfahrenTone="accent"
            score={42}
            status="error"
            statusLabel="Brandschutzkonzept fehlt"
          />
        </div>
        <p className="text-xs text-neutral-500">
          Diese Karten sind statische Vorschauen. In Phase 5 lesen wir Ihre echten Projekte aus der Datenbank.
        </p>
      </section>
    </div>
  );
}

function PreviewProjectCard({
  title,
  location,
  verfahren,
  verfahrenTone,
  score,
  status,
  statusLabel,
}: {
  title: string;
  location: string;
  verfahren: string;
  verfahrenTone: 'primary' | 'success' | 'accent' | 'warning' | 'error' | 'neutral';
  score: number;
  status: 'success' | 'warning' | 'error' | 'neutral' | 'pending';
  statusLabel: string;
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <Badge tone={verfahrenTone}>{verfahren}</Badge>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ScoreRing score={score} size={72} />
          <div className="space-y-1">
            <StatusDot tone={status} label={statusLabel} />
            <p className="text-xs text-neutral-500">
              Confidence-Score wird bei jeder Änderung neu berechnet.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
