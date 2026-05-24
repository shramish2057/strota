import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/auth-layout';
import { VerifyEmailFlow } from './verify-email-flow';

export const metadata: Metadata = {
  title: 'E-Mail bestätigen',
  description: 'Bestätigen Sie Ihre E-Mail-Adresse mit dem zugesandten Link.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const { token } = await searchParams;
  return (
    <AuthLayout
      title="E-Mail-Adresse bestätigen"
      subtitle="Sobald Ihre E-Mail-Adresse bestätigt ist, können Sie sich anmelden."
    >
      <VerifyEmailFlow token={token ?? ''} />
    </AuthLayout>
  );
}
