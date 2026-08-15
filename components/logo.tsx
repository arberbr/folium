/**
 * The arXivDesk mark: three rules condensing from a full abstract to a briefing.
 *
 * Bars only, in `currentColor`, so the header chip can tint it with theme tokens. The standalone
 * app icon (`app/icon.svg`) draws the same geometry on its own navy tile and picks the last bar
 * out in mint, which a favicon needs to stand alone but the in-app chip does not.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" className={className}>
      <rect width="36" height="8" rx="4" />
      <rect y="14" width="26" height="8" rx="4" fillOpacity="0.6" />
      <rect y="28" width="16" height="8" rx="4" />
    </svg>
  );
}
