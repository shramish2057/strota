'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@strota/ui';
import { CATEGORIES, PRIMARY_LINKS, type NavCategory } from './nav-config';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { StrotaWordmark } from './wordmark';

export function SiteNav(): JSX.Element {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  const closeAll = useCallback(() => {
    setOpenLabel(null);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeAll();
    }
    function onClick(event: MouseEvent): void {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) closeAll();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [closeAll]);

  const activeCategory: NavCategory | null =
    CATEGORIES.find((cat) => cat.label === openLabel) ?? null;

  return (
    <header
      ref={rootRef}
      className="sticky top-0 z-40 border-b border-neutral-200 bg-bg-elevated/95 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="Strota Startseite">
            <StrotaWordmark className="h-7 w-auto text-primary-900" />
          </Link>
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 lg:flex">
            {CATEGORIES.map((cat) => (
              <CategoryTrigger
                key={cat.label}
                label={cat.label}
                isOpen={openLabel === cat.label}
                onToggle={() => setOpenLabel(openLabel === cat.label ? null : cat.label)}
              />
            ))}
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link
            href="/demo"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary-800 md:inline-flex"
          >
            Demo buchen
          </Link>
          <Link
            href="/login"
            className="hidden rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 md:inline-flex"
          >
            Anmelden
          </Link>
          <Link href="/signup" className="hidden md:inline-flex">
            <Button size="sm">Kostenlos starten</Button>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-900 lg:hidden"
            aria-label="Menue oeffnen"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <span aria-hidden className="text-xl leading-none">
              ☰
            </span>
          </button>
        </div>
      </div>

      {activeCategory ? (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-neutral-200 bg-bg-elevated shadow-lg">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
            <MegaMenu category={activeCategory} onItemClick={closeAll} />
          </div>
        </div>
      ) : null}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function CategoryTrigger({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isOpen
          ? 'bg-primary-50 text-primary-800'
          : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-800'
      }`}
    >
      {label}
      <span aria-hidden className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▾
      </span>
    </button>
  );
}

function LocaleSwitcher(): JSX.Element {
  return (
    <div className="hidden items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-700 md:inline-flex">
      <span className="text-primary-700">DE</span>
      <span aria-hidden className="text-neutral-300">
        |
      </span>
      <Link href="/?lang=en" className="hover:text-primary-700">
        EN
      </Link>
    </div>
  );
}
