// videoVariant.js — pick the right MP4 quality for the current device + connection.
//
// We serve two variants of each character video:
//   /<slug>.mp4       — 1080p, ~1 MB,   the cinematic full-quality file
//   /720/<slug>.mp4   — 720p,  ~400 KB, smaller variant for mobile / slow networks
//
// Decision (first match wins):
//   - state.skippedIntro = true                            → 720p (skip-intro users
//                                                            didn't earn the heavy
//                                                            variant by watching)
//   - saveData on, OR effectiveType is 2g / slow-2g / 3g  → 720p
//   - viewport width ≤ 768 (mobile)                        → 720p
//   - otherwise (desktop + decent connection + full intro) → 1080p
//
// On iOS Safari `navigator.connection` is undefined; the slow-network branch
// is skipped, and we fall through to the viewport-width check. iOS mobile
// still gets the 720p variant, iOS desktop gets full quality. Acceptable
// degradation — iOS users without explicit "data saver" pay the small cost.
//
// The poster image (~20 KB webp) is what shows while the video buffers, so
// even on extreme slow connections the visual experience never degrades to
// pure black — just a frozen first-frame portrait until enough bytes arrive.

import { state } from './StateManager.js';

export function pickVideoSrc(originalSrc) {
  if (state.skippedIntro) {
    return originalSrc.replace(/^\/(?!720\/)([^/]+\.mp4)$/, '/720/$1');
  }
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

// Archive pillar videos ALWAYS use 720p. They render at ~250 px wide in the
// pillar carousel — 1080p is invisible-quality overkill, and four concurrent
// ~1 MB downloads (one per pillar) saturate Chrome's low-priority queue on
// flaky networks, leaving pillars stuck on their poster frame. 720p drops
// per-file size from ~1 MB → ~400 KB (60 % cut, total ~4 MB → ~1.6 MB across
// all four).
export function pickPillarSrc(originalSrc) {
  return originalSrc.replace(/^\/(?!720\/)([^/]+\.mp4)$/, '/720/$1');
}
