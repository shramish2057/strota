/**
 * Inline-SVG icons. No third-party icon library - one less dep, one less
 * thing to wait on, and Strota's icon set is small enough.
 *
 * All icons are 20x20 stroke-currentColor so they inherit text color.
 */
import type { SVGProps } from 'react';

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function IconDashboard(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconProjects(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <path d="M3 5a2 2 0 0 1 2-2h3l2 2h5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
    </svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <path d="M3 10l4 4 10-10" />
    </svg>
  );
}

export function IconLetters(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="4" width="15" height="12" rx="2" />
      <path d="M3 6l7 5 7-5" />
    </svg>
  );
}

export function IconSettings(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function IconMenu(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function IconBell(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <path d="M5 8a5 5 0 0 1 10 0v3l1 2H4l1-2V8z" />
      <path d="M8 16a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconUser(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="7" r="3" />
      <path d="M3.5 17a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function IconLogo(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </svg>
  );
}
