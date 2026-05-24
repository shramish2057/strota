'use client';

import Link from 'next/link';
import { IconBell, IconLogo, IconMenu, IconUser } from './icons';

export interface TopBarProps {
  onOpenMobileNav?: () => void;
  user?: { full_name?: string | null; email: string } | null;
}

/**
 * Top bar 56px. On mobile shows hamburger + logo + bell + user; on desktop
 * the hamburger is hidden (sidebar is always visible).
 */
export function TopBar({ onOpenMobileNav, user }: TopBarProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-bg-elevated px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Navigation oeffnen"
          className="rounded-sm p-2 text-neutral-700 hover:bg-neutral-100 md:hidden"
        >
          <IconMenu />
        </button>
        <Link
          href="/app"
          className="flex items-center gap-2 text-primary-900 md:hidden"
          aria-label="Strota Dashboard"
        >
          <IconLogo />
          <span className="font-display text-lg">Strota</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Benachrichtigungen"
          className="relative rounded-sm p-2 text-neutral-700 hover:bg-neutral-100"
        >
          <IconBell />
        </button>
        <button
          type="button"
          aria-label={user?.full_name ?? user?.email ?? 'Konto'}
          className="rounded-sm p-2 text-neutral-700 hover:bg-neutral-100"
        >
          <IconUser />
        </button>
      </div>
    </header>
  );
}
