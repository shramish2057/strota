import type { HTMLAttributes } from 'react';
import { cn } from './cn.js';

export type StatusTone = 'success' | 'warning' | 'error' | 'neutral' | 'pending';

export interface StatusDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  tone: StatusTone;
  label: string;
}

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-success-600',
  warning: 'bg-warning-500',
  error: 'bg-error-600',
  neutral: 'bg-neutral-500',
  pending: 'bg-accent-500 animate-pulse',
};

/**
 * Status badge per v5.0 Bible Part 2.5: colored dot + text label.
 * Combines color, glyph (the dot), and text so it satisfies WCAG 1.4.1
 * (no color-only information).
 */
export function StatusDot({ tone, label, className, ...rest }: StatusDotProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs font-medium text-neutral-900',
        className,
      )}
      role="status"
      aria-label={label}
      {...rest}
    >
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', toneClasses[tone])} />
      {label}
    </span>
  );
}
