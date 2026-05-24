import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@strota/ui';
import { fetchCurrentUser } from '../../../lib/auth-server';
import { LogoutButton } from './logout-button';

export const metadata: Metadata = {
  title: 'Einstellungen',
  robots: { index: false, follow: false },
};

export default async function SettingsPage(): Promise<JSX.Element> {
  const user = await fetchCurrentUser();
  if (!user) return <></>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-primary-900">Einstellungen</h1>
      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="text-neutral-500">Name:</span>{' '}
            <span className="text-neutral-900">{user.full_name ?? 'nicht hinterlegt'}</span>
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">E-Mail bestätigt:</span>{' '}
            <span className="text-neutral-900">{user.email_verified ? 'ja' : 'nein'}</span>
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Rolle:</span>{' '}
            <span className="text-neutral-900">{user.role}</span>
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Bauvorlageberechtigung:</span>{' '}
            <span className="text-neutral-900">{user.bauvorlageberechtigung}</span>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sitzung</CardTitle>
          <CardDescription>
            Mit dem Abmelden werden alle aktiven Refresh-Tokens dieser Sitzung widerrufen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
