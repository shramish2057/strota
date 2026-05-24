'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV } from './nav-items';

/**
 * Mobile bottom tab bar. 5 items per v5.0 Bible Part 2.4.
 * Visible only below md breakpoint.
 */
export function BottomTabBar(): JSX.Element {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile-Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-neutral-200 bg-bg-elevated md:hidden"
    >
      {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs ${
              active ? 'text-primary-700 font-semibold' : 'text-neutral-700'
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
