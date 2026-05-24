import type { ReactNode } from 'react';

export function LegalPage({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="border-b border-neutral-200 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Rechtliche Information
        </p>
        <h1 className="mt-3 font-display text-4xl text-primary-900">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-neutral-700">{subtitle}</p>
        ) : null}
        <p className="mt-4 text-sm text-neutral-500">
          Stand: <time dateTime={lastUpdated}>{lastUpdated}</time>
        </p>
      </header>
      <div className="mt-8 space-y-4 text-neutral-900 legal-prose">
        {children}
      </div>
    </article>
  );
}
