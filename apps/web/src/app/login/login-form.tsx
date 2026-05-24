'use client';

import { Button, Field, Input } from '@strota/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authErrorMessage } from '../../components/auth/auth-error';

export function LoginForm(): JSX.Element {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    setPending(false);
    if (!resp.ok) {
      const detail = (await resp.json()) as { detail?: { code?: string } };
      setError(authErrorMessage(detail.detail?.code));
      return;
    }
    router.push('/app');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="E-Mail-Adresse" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@beispiel.de"
        />
      </Field>
      <Field label="Passwort" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={12}
        />
      </Field>
      {error ? (
        <p role="alert" className="text-sm text-error-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Wird angemeldet ...' : 'Anmelden'}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href="/magic-link" className="text-primary-600 underline">
          Anmeldelink per E-Mail
        </Link>
        <Link href="/passwort-zuruecksetzen" className="text-primary-600 underline">
          Passwort vergessen?
        </Link>
      </div>
      <p className="text-center text-sm text-neutral-700">
        Noch kein Konto?{' '}
        <Link href="/signup" className="text-primary-600 underline">
          Konto erstellen
        </Link>
      </p>
    </form>
  );
}
