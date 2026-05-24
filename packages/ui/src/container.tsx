import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from './cn.js';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'narrow' | 'default' | 'wide';
}

const sizeClasses = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
} as const;

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', ...props }, ref) => (
    <div ref={ref} className={cn('mx-auto w-full px-6', sizeClasses[size], className)} {...props} />
  ),
);
Container.displayName = 'Container';
