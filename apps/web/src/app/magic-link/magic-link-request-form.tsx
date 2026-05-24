'use client';

import { Button, Field, Input } from '@strota/ui';
import Link from 'next/link';
import { useState } from 'react';

export function MagicLinkRequestForm(): JSX.Element {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    await fetch('/api/auth/magic-link/request', {
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
        Falls ein Konto mit dieser Adresse existiert, haben wir Ihnen einen Anmeldelink
        geschickt.
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
        {pending ? 'Wird gesendet ...' : 'Anmeldelink senden'}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary-600 underline">
          Lieber mit Passwort anmelden
        </Link>
      </p>
    </form>
  );
}
