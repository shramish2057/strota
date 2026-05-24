import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/auth-layout';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Konto erstellen',
  description: 'Strota ist für berufsmäßige Bauantragsteller. Konto in zwei Schritten erstellen.',
  robots: { index: false, follow: false },
};

export default function SignupPage(): JSX.Element {
  return (
    <AuthLayout
      title="Konto erstellen"
      subtitle="Strota ist für berufsmäßige Bauantragsteller. Sie bestätigen Ihre E-Mail-Adresse im zweiten Schritt."
    >
      <SignupForm />
    </AuthLayout>
  );
}
