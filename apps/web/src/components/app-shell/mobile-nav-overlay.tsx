'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconClose, IconLogo } from './icons';
import { PRIMARY_NAV } from './nav-items';

export interface MobileNavOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile nav with focus-trap behavior via tabindex on close button.
 * Only used on mobile; tablet+ rely on the sidebar.
 */
export function MobileNavOverlay({ open, onClose }: MobileNavOverlayProps): JSX.Element | null {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hauptnavigation"
      className="fixed inset-0 z-40 md:hidden"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-bg-elevated shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <Link href="/app" onClick={onClose} className="flex items-center gap-2 text-primary-900">
            <IconLogo />
            <span className="font-display text-lg">Strota</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Navigation schliessen"
            autoFocus
            className="rounded-sm p-2 text-neutral-700 hover:bg-neutral-100"
          >
            <IconClose />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-sm px-3 py-3 text-base ${
                      active
                        ? 'bg-primary-50 text-primary-900 font-semibold'
                        : 'text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
