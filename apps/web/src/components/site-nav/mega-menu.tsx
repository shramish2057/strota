'use client';

import Link from 'next/link';
import { Badge } from '@strota/ui';
import type { NavCategory } from './nav-config';

type Props = {
  category: NavCategory;
  onItemClick?: () => void;
};

export function MegaMenu({ category, onItemClick }: Props): JSX.Element {
  return (
    <div className="absolute left-1/2 top-full z-40 mt-2 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-neutral-200 bg-bg-elevated p-8 shadow-xl">
      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <aside className="border-b border-neutral-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <p className="font-mono text-xs uppercase tracking-widest text-primary-600">
            {category.intro.eyebrow}
          </p>
          <h3 className="mt-2 font-display text-xl leading-snug text-primary-900">
            {category.intro.headline}
          </h3>
          <p className="mt-3 text-sm text-neutral-700">{category.intro.body}</p>
          <Link
            href={category.cta.href}
            onClick={onItemClick}
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            {category.cta.label}
            <span aria-hidden>›</span>
          </Link>
        </aside>
        <div className="grid gap-6 md:grid-cols-2">
          {category.groups.map((group) => (
            <div key={group.heading}>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                {group.heading}
              </p>
              <ul className="mt-3 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onItemClick}
                      className="group block rounded-sm p-2 -mx-2 transition-colors hover:bg-primary-50"
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
    </div>
  );
}

function badgeTone(badge: NonNullable<NavCategory['groups'][number]['items'][number]['badge']>):
  | 'success'
  | 'primary'
  | 'warning'
  | 'neutral' {
  switch (badge) {
    case 'Live':
      return 'success';
    case 'Bayern':
      return 'primary';
    case 'Beta':
      return 'warning';
    case 'Roadmap':
      return 'neutral';
  }
}
