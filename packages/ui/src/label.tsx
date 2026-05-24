import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from './cn.js';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-neutral-900',
        'has-[+_input[aria-invalid="true"]]:text-error-700',
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = 'Label';
