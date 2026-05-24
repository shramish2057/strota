'use client';

import { Button } from '@strota/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authErrorMessage } from '../../components/auth/auth-error';

type State = { kind: 'idle' } | { kind: 'pending' } | { kind: 'ok' } | { kind: 'error'; msg: string };

export function VerifyEmailFlow({ token }: { token: string }): JSX.Element {
  const [state, setState] = useState<State>({ kind: token ? 'pending' : 'idle' });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const resp = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (cancelled) return;
      if (resp.ok) {
        setState({ kind: 'ok' });
      } else {
        const detail = (await resp.json()) as { detail?: { code?: string } };
        setState({ kind: 'error', msg: authErrorMessage(detail.detail?.code) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <p className="text-sm text-neutral-700">
        Ohne einen Bestätigungs-Link kann diese Seite nichts tun. Bitte öffnen Sie den
        Link aus unserer E-Mail.
      </p>
    );
  }
  if (state.kind === 'pending') return <p className="text-sm text-neutral-700">Wird bestätigt ...</p>;
  if (state.kind === 'ok') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-success-700">
          Vielen Dank, Ihre E-Mail-Adresse ist jetzt bestätigt.
        </p>
        <Link href="/login">
          <Button className="w-full">Jetzt anmelden</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p role="alert" className="text-sm text-error-700">
        {state.kind === 'error' ? state.msg : ''}
      </p>
      <p className="text-sm text-neutral-700">
        Fordern Sie einen neuen Bestätigungs-Link an, indem Sie sich erneut anmelden oder einen{' '}
        <Link href="/magic-link" className="text-primary-600 underline">
          Anmeldelink per E-Mail
        </Link>{' '}
        anfordern.
      </p>
    </div>
  );
}
