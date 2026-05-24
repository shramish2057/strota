/**
 * Decorative inline SVG for the hero panel. Pure CSS/SVG, no external asset.
 * Renders a subtle grid + isometric building wireframe in teal tones, sitting
 * underneath the product preview to anchor it without competing for attention.
 */
export function HeroBackdrop(): JSX.Element {
  return (
    <svg
      viewBox="0 0 800 600"
      aria-hidden
      className="absolute inset-0 -z-10 h-full w-full opacity-90"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="strota-hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#effaf9" />
          <stop offset="60%" stopColor="#d2f0ec" />
          <stop offset="100%" stopColor="#b8eae6" />
        </linearGradient>
        <pattern id="strota-hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#117c78" strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#strota-hero-bg)" />
      <rect width="100%" height="100%" fill="url(#strota-hero-grid)" />

      {/* Isometric building outline, abstract */}
      <g stroke="#0e6360" strokeOpacity="0.22" strokeWidth="1.5" fill="none">
        <path d="M 460 380 L 620 320 L 620 180 L 460 240 Z" />
        <path d="M 460 380 L 460 240 L 300 180 L 300 320 Z" />
        <path d="M 460 240 L 620 180 L 460 120 L 300 180 Z" />
        <line x1="460" y1="380" x2="460" y2="240" />
        <line x1="300" y1="320" x2="460" y2="380" />
        <line x1="620" y1="320" x2="460" y2="380" />
        {/* Windows hint */}
        <line x1="490" y1="328" x2="490" y2="265" />
        <line x1="520" y1="316" x2="520" y2="253" />
        <line x1="550" y1="305" x2="550" y2="242" />
        <line x1="580" y1="293" x2="580" y2="230" />
      </g>

      {/* Soft radial highlight top-left */}
      <circle cx="120" cy="120" r="220" fill="#34b1a8" fillOpacity="0.08" />
    </svg>
  );
}
