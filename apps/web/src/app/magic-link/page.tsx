import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/auth-layout';
import { MagicLinkRequestForm } from './magic-link-request-form';

export const metadata: Metadata = {
  title: 'Anmeldelink per E-Mail',
  description: 'Sicherer Anmeldelink ohne Passwort.',
  robots: { index: false, follow: false },
};

export default function MagicLinkPage(): JSX.Element {
  return (
    <AuthLayout
      title="Anmeldelink per E-Mail"
      subtitle="Wir senden Ihnen einen Link, der Sie automatisch anmeldet. Der Link ist 15 Minuten gültig."
    >
      <MagicLinkRequestForm />
    </AuthLayout>
  );
}
