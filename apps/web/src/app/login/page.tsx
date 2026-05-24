import type { Metadata } from 'next';
import { LoginForm } from './login-form';
import { AuthLayout } from '../../components/auth/auth-layout';

export const metadata: Metadata = {
  title: 'Anmelden',
  description: 'Mit Ihrer Strota-E-Mail-Adresse und Passwort anmelden.',
  robots: { index: false, follow: false },
};

export default function LoginPage(): JSX.Element {
  return (
    <AuthLayout title="Anmelden" subtitle="Mit Ihrer E-Mail-Adresse und Passwort anmelden.">
      <LoginForm />
    </AuthLayout>
  );
}
