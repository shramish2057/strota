import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '../../components/app-shell';
import { fetchCurrentUser } from '../../lib/auth-server';

export default async function AppLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const user = await fetchCurrentUser();
  if (!user) redirect('/login');
  return <AppShell user={{ full_name: user.full_name, email: user.email }}>{children}</AppShell>;
}
