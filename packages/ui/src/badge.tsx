import type { HTMLAttributes } from 'react';
import { cn } from './cn.js';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'accent' | 'primary';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  success: 'bg-success-100 text-success-700 border-success-100',
  warning: 'bg-warning-100 text-warning-700 border-warning-100',
  error: 'bg-error-100 text-error-700 border-error-100',
  accent: 'bg-accent-100 text-accent-700 border-accent-100',
  primary: 'bg-primary-100 text-primary-700 border-primary-100',
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
