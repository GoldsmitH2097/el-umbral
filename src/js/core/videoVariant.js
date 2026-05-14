// videoVariant.js — pick the right MP4 quality for the current device + connection.
//
// We serve two variants of each character video:
//   /<slug>.mp4       — 1080p, ~1 MB,   the cinematic full-quality file
//   /720/<slug>.mp4   — 720p,  ~400 KB, smaller variant for mobile / slow networks
//
// Decision:
//   - saveData on, OR effectiveType is 2g / slow-2g / 3g → 720p
//   - viewport width ≤ 768 (mobile)                       → 720p
//   - otherwise (desktop + decent connection)             → 1080p
//
// On iOS Safari `navigator.connection` is undefined; the slow-network branch
// is skipped, and we fall through to the viewport-width check. iOS mobile
// still gets the 720p variant, iOS desktop gets full quality. Acceptable
// degradation — iOS users without explicit "data saver" pay the small cost.
//
// The poster image (~20 KB webp) is what shows while the video buffers, so
// even on extreme slow connections the visual experience never degrades to
// pure black — just a frozen first-frame portrait until enough bytes arrive.

export function pickVideoSrc(originalSrc) {
  const c = typeof navigator !== 'undefined' ? navigator.connection : null;
  const slowConn = !!c && (
    c.saveData === true ||
    c.effectiveType === 'slow-2g' ||
    c.effectiveType === '2g' ||
    c.effectiveType === '3g'
  );
  const smallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (slowConn || smallScreen) {
    // /reina-sin-corona.mp4 → /720/reina-sin-corona.mp4
    return originalSrc.replace(/^\/(?!720\/)([^/]+\.mp4)$/, '/720/$1');
  }
  return originalSrc;
}
