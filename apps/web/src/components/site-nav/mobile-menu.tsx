'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@strota/ui';
import { CATEGORIES, PRIMARY_LINKS } from './nav-config';
import { StrotaWordmark } from './wordmark';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: Props): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-bg-base lg:hidden" role="dialog" aria-modal="true">
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 bg-bg-elevated px-4">
        <Link href="/" onClick={onClose} aria-label="Strota Startseite">
          <StrotaWordmark className="h-7 w-auto text-primary-900" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Menü schließen"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-300 text-neutral-900"
        >
          <span aria-hidden className="text-xl leading-none">
            ✕
          </span>
        </button>
      </div>
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6">
        <nav aria-label="Mobile-Navigation" className="space-y-6">
          {CATEGORIES.map((cat) => (
            <details key={cat.label} className="group rounded-md border border-neutral-200 bg-bg-elevated">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-primary-900">
                <span>{cat.label}</span>
                <span aria-hidden className="text-neutral-500 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="space-y-4 border-t border-neutral-200 px-4 py-4">
                {cat.groups.map((group) => (
                  <div key={group.heading}>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                      {group.heading}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="block py-1 text-sm font-medium text-neutral-900 hover:text-primary-700"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block rounded-md border border-neutral-200 bg-bg-elevated px-4 py-3 font-semibold text-primary-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 space-y-3">
          <Link href="/signup" onClick={onClose} className="block">
            <Button variant="accent" size="lg" className="w-full">
              Kostenlos starten
            </Button>
          </Link>
          <Link href="/login" onClick={onClose} className="block">
            <Button variant="secondary" size="lg" className="w-full">
              Anmelden
            </Button>
          </Link>
          <Link href="/demo" onClick={onClose} className="block">
            <Button variant="ghost" size="lg" className="w-full">
              Demo buchen
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
