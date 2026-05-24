'use client';

import Link from 'next/link';
import { Badge } from '@strota/ui';
import type { NavBadge, NavCategory } from './nav-config';

type Props = {
  category: NavCategory;
  onItemClick?: () => void;
};

export function MegaMenu({ category, onItemClick }: Props): JSX.Element {
  return (
    <div className="grid gap-10 md:grid-cols-[18rem_1fr]">
      <aside className="border-b border-neutral-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
          {category.intro.eyebrow}
        </p>
        <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-primary-900">
          {category.intro.headline}
        </h3>
        <p className="mt-3 text-sm text-neutral-700">{category.intro.body}</p>
        <Link
          href={category.cta.href}
          onClick={onItemClick}
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
        >
          {category.cta.label}
          <span aria-hidden>›</span>
        </Link>
      </aside>
      <div className="grid gap-8 md:grid-cols-2">
        {category.groups.map((group) => (
          <div key={group.heading}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {group.heading}
            </p>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className="group block rounded-md p-3 -mx-3 transition-colors hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 group-hover:text-primary-800">
                        {item.title}
                      </span>
                      {item.badge ? (
                        <Badge tone={badgeTone(item.badge)}>{item.badge}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                      {item.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function badgeTone(badge: NavBadge):
  | 'success'
  | 'primary'
  | 'warning'
  | 'neutral'
  | 'accent' {
  switch (badge) {
    case 'Live':
      return 'success';
    case 'Bayern':
      return 'primary';
    case 'Beta':
      return 'warning';
    case 'Roadmap':
      return 'neutral';
    case 'Kostenlos':
      return 'accent';
    case 'KI':
      return 'primary';
  }
}
