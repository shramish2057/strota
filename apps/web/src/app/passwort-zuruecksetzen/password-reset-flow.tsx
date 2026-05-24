'use client';

import { Button, Field, Input } from '@strota/ui';
import Link from 'next/link';
import { useState } from 'react';
import { authErrorMessage } from '../../components/auth/auth-error';

/**
 * Two modes:
 *  - no token: request mode (send reset email)
 *  - with token: confirm mode (set new password)
 */
export function PasswordResetFlow({ token }: { token: string }): JSX.Element {
  return token ? <ConfirmForm token={token} /> : <RequestForm />;
}

function RequestForm(): JSX.Element {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: form.get('email') }),
    });
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-neutral-900">
        Falls ein Konto mit dieser Adresse existiert, haben wir Ihnen einen Link
        geschickt. Der Link ist 24 Stunden gültig.
      </p>
    );
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
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Wird gesendet ...' : 'Reset-Link senden'}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary-600 underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </form>
  );
}

function ConfirmForm({ token }: { token: string }): JSX.Element {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const resp = await fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, new_password: form.get('new_password') }),
    });
    setPending(false);
    if (!resp.ok) {
      const detail = (await resp.json()) as { detail?: { code?: string } };
      setError(authErrorMessage(detail.detail?.code));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-success-700">
          Passwort gesetzt. Bitte melden Sie sich mit dem neuen Passwort an.
        </p>
        <Link href="/login">
          <Button className="w-full">Zur Anmeldung</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Neues Passwort"
        htmlFor="new_password"
        hint="Mindestens 12 Zeichen. Wir empfehlen einen Passwort-Manager."
      >
        <Input
          id="new_password"
          name="new_password"
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
        {pending ? 'Wird gesetzt ...' : 'Neues Passwort setzen'}
      </Button>
    </form>
  );
}
