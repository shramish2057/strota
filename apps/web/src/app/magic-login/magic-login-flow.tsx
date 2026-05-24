'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authErrorMessage } from '../../components/auth/auth-error';

type State = { kind: 'pending' } | { kind: 'error'; msg: string };

export function MagicLoginFlow({ token }: { token: string }): JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'pending' });

  useEffect(() => {
    if (!token) {
      setState({ kind: 'error', msg: 'Kein gültiger Anmeldelink.' });
      return;
    }
    let cancelled = false;
    (async () => {
      const resp = await fetch('/api/auth/magic-link/consume', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (cancelled) return;
      if (resp.ok) {
        router.push('/app');
        router.refresh();
      } else {
        const detail = (await resp.json()) as { detail?: { code?: string } };
        setState({ kind: 'error', msg: authErrorMessage(detail.detail?.code) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  if (state.kind === 'pending') return <p className="text-sm text-neutral-700">Wird angemeldet ...</p>;
  return (
    <div className="space-y-3">
      <p role="alert" className="text-sm text-error-700">
        {state.msg}
      </p>
      <p className="text-sm text-neutral-700">
        <Link href="/magic-link" className="text-primary-600 underline">
          Neuen Anmeldelink anfordern
        </Link>
      </p>
    </div>
  );
}
