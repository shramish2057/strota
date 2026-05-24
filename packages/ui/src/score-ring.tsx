import { cn } from './cn.js';

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Vollstaendigkeitspruefer Score Ring per v5.0 Bible Part 2.5.
 * Score thresholds: >=90 green, 75-89 amber, 50-74 orange, <50 red.
 */
export function ScoreRing({
  score,
  size = 96,
  strokeWidth = 8,
  className,
}: ScoreRingProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  const tone =
    clamped >= 90
      ? 'stroke-success-600'
      : clamped >= 75
        ? 'stroke-accent-500'
        : clamped >= 50
          ? 'stroke-warning-500'
          : 'stroke-error-600';

  const textTone =
    clamped >= 90
      ? 'text-success-700'
      : clamped >= 75
        ? 'text-accent-700'
        : clamped >= 50
          ? 'text-warning-700'
          : 'text-error-700';

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Vollstaendigkeits-Score: ${clamped} von 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          className="text-neutral-200"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={tone}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center font-mono text-lg font-semibold tabular-nums',
          textTone,
        )}
      >
        {clamped}
      </span>
    </div>
  );
}
