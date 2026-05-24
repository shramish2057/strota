'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLogo } from './icons';
import { PRIMARY_NAV } from './nav-items';

/**
 * Desktop sidebar 240px. Collapses to 56px icon-only on tablets via responsive
 * variant in the layout. Active item gets primary-50 background + primary-900 text.
 */
export function Sidebar({ collapsed = false }: { collapsed?: boolean }): JSX.Element {
  const pathname = usePathname();
  return (
    <aside
      aria-label="Hauptnavigation"
      className={`hidden h-screen shrink-0 flex-col border-r border-neutral-200 bg-bg-subtle md:flex ${
        collapsed ? 'w-14' : 'lg:w-60'
      } w-14 lg:w-60`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-neutral-200 px-4">
        <Link
          href="/app"
          className="flex items-center gap-2 text-primary-900"
          aria-label="Strota Dashboard"
        >
          <IconLogo />
          <span className="hidden font-display text-lg lg:inline">Strota</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm ${
                    active
                      ? 'bg-primary-50 text-primary-900 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
