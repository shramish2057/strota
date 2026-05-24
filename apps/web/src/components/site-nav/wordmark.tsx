export function StrotaWordmark({ className }: { className?: string }): JSX.Element {
  return (
    <span className={`inline-flex items-baseline font-display text-2xl leading-none ${className ?? ''}`}>
      strota
      <span aria-hidden className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
    </span>
  );
}
