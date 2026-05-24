'use client';

import { useState, type ReactNode } from 'react';
import { BottomTabBar } from './bottom-tab-bar';
import { MobileNavOverlay } from './mobile-nav-overlay';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

export interface AppShellProps {
  user?: { full_name?: string | null; email: string } | null;
  inspector?: ReactNode;
  children: ReactNode;
}

/**
 * Strota App Shell per v5.0 Bible Part 2.4.
 * Desktop (>=1024): sidebar 240px + top 56px + content (max 1280px) + optional inspector 320px.
 * Tablet (768-1023): sidebar collapses to 56px icon-only; inspector becomes bottom sheet.
 * Mobile (<768): sidebar hidden; top bar + bottom tab bar; nav available via hamburger overlay.
 */
export function AppShell({ user, inspector, children }: AppShellProps): JSX.Element {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} user={user} />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="mx-auto max-w-screen-xl px-4 py-6 md:px-6 md:py-8">{children}</div>
          </main>
          {inspector ? (
            <aside
              aria-label="Inspector"
              className="hidden w-80 shrink-0 overflow-y-auto border-l border-neutral-200 bg-bg-subtle lg:block"
            >
              {inspector}
            </aside>
          ) : null}
        </div>
      </div>
      <BottomTabBar />
      <MobileNavOverlay open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
