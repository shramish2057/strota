import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/auth-layout';
import { MagicLoginFlow } from './magic-login-flow';

export const metadata: Metadata = {
  title: 'Anmeldung läuft',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function MagicLoginPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const { token } = await searchParams;
  return (
    <AuthLayout title="Anmeldung läuft" subtitle="Bitte warten Sie einen Moment ...">
      <MagicLoginFlow token={token ?? ''} />
    </AuthLayout>
  );
}
