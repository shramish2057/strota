import type { ComponentType, SVGProps } from 'react';
import { IconCheck, IconDashboard, IconLetters, IconProjects, IconSettings } from './icons';

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Bottom-tab bar shows exactly 5 items on mobile per v5.0 Bible Part 2.4.
 * Sidebar on desktop shows the same 5 (Phase 5+ may add more groups).
 */
export const PRIMARY_NAV: readonly NavItem[] = [
  { href: '/app', label: 'Dashboard', icon: IconDashboard },
  { href: '/app/projekte', label: 'Projekte', icon: IconProjects },
  { href: '/app/pruefen', label: 'Pruefen', icon: IconCheck },
  { href: '/app/briefe', label: 'Briefe', icon: IconLetters },
  { href: '/app/einstellungen', label: 'Einstellungen', icon: IconSettings },
];
