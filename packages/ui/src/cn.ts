import { clsx, type ClassValue } from 'clsx';

/** Conditional className join helper used by all primitives. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
