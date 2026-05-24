import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Shared shell for /login, /signup, /verify-email, /passwort-zuruecksetzen,
 * /magic-login. Centred card on bg-base with the Strota wordmark up top.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center bg-bg-base px-4 py-12">
      <Link href="/" className="font-display text-2xl text-primary-900">
        Strota
      </Link>
      <div className="mt-10 w-full max-w-md rounded-md border border-neutral-200 bg-bg-elevated p-8 shadow-sm">
        <h1 className="font-display text-2xl text-primary-900">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-neutral-700">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
