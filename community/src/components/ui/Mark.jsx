/** Neutral geometric mark used until an official logo is supplied. */
export default function Mark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" transform="rotate(45 12 12)" />
      <rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" transform="rotate(45 12 12)" />
    </svg>
  );
}
