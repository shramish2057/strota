/**
 * Hero background video. Pexels-licensed clip (see public/media/LICENSES.md).
 * Server-rendered as a plain <video> tag with autoplay, muted, loop, playsInline.
 * Falls back to the poster image if the browser blocks autoplay or the file
 * is missing. No JS dependency, so it works in the App Router server boundary.
 */
export function HeroVideo(): JSX.Element {
  return (
    <video
      className="absolute inset-0 -z-10 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster="/media/hero-poster.jpg"
      aria-hidden
    >
      <source src="/media/hero-placeholder.mp4" type="video/mp4" />
    </video>
  );
}
