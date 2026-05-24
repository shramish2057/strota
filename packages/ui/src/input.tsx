import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'block w-full rounded-sm border bg-bg-elevated px-3 py-2 text-sm text-neutral-900',
          'placeholder:text-neutral-500',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          invalid ? 'border-error-600 focus-visible:outline-error-600' : 'border-neutral-300',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
