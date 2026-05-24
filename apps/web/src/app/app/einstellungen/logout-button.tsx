'use client';

import { Button } from '@strota/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton(): JSX.Element {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout(): Promise<void> {
    setPending(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }
  return (
    <Button variant="secondary" onClick={logout} disabled={pending}>
      {pending ? 'Wird abgemeldet ...' : 'Abmelden'}
    </Button>
  );
}
