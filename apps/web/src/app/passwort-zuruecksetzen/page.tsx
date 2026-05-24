import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/auth-layout';
import { PasswordResetFlow } from './password-reset-flow';

export const metadata: Metadata = {
  title: 'Passwort zurücksetzen',
  description: 'Setzen Sie Ihr Strota-Passwort zurück.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function PasswordResetPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const { token } = await searchParams;
  return (
    <AuthLayout
      title="Passwort zurücksetzen"
      subtitle={
        token
          ? 'Vergeben Sie ein neues Passwort. Mindestens 12 Zeichen.'
          : 'Geben Sie Ihre E-Mail-Adresse an; wir senden Ihnen einen Link.'
      }
    >
      <PasswordResetFlow token={token ?? ''} />
    </AuthLayout>
  );
}
