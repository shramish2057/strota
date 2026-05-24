'use client';

import { Button, Field, Input } from '@strota/ui';
import Link from 'next/link';
import { useState } from 'react';
import { authErrorMessage } from '../../components/auth/auth-error';

export function SignupForm(): JSX.Element {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const resp = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
        full_name: form.get('full_name'),
      }),
    });
    setPending(false);
    if (!resp.ok) {
      const detail = (await resp.json()) as { detail?: { code?: string } };
      setError(authErrorMessage(detail.detail?.code));
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="space-y-4 text-sm text-neutral-900">
        <p>
          Wir haben Ihnen einen Bestätigungs-Link an Ihre E-Mail-Adresse geschickt. Bitte
          öffnen Sie den Link in den nächsten 24 Stunden, um Ihr Konto zu aktivieren.
        </p>
        <p className="text-neutral-700">
          Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner oder fordern Sie unter{' '}
          <Link href="/magic-link" className="text-primary-600 underline">
            Anmeldelink per E-Mail
          </Link>{' '}
          eine neue Zustellung an.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Vor- und Nachname" htmlFor="full_name">
        <Input
          id="full_name"
          name="full_name"
          autoComplete="name"
          required
          placeholder="Anna Beispiel"
        />
      </Field>
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
      <Field
        label="Passwort"
        htmlFor="password"
        hint="Mindestens 12 Zeichen. Wir empfehlen einen Passwort-Manager."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
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
        {pending ? 'Konto wird erstellt ...' : 'Konto erstellen'}
      </Button>
      <p className="text-center text-sm text-neutral-700">
        Schon ein Konto?{' '}
        <Link href="/login" className="text-primary-600 underline">
          Anmelden
        </Link>
      </p>
      <p className="text-xs text-neutral-500">
        Mit dem Erstellen eines Kontos akzeptieren Sie unseren{' '}
        <Link href="/avv" className="underline">
          AVV
        </Link>{' '}
        sowie unsere{' '}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>
        .
      </p>
    </form>
  );
}
