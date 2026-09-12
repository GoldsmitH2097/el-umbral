// ReaderMemory.js — the building learns the reader's hand.
//
// STRICTLY LOCAL AND EPHEMERAL. Nothing here is written to localStorage,
// cookies, IndexedDB, or the network. It lives in this tab's RAM and dies when
// the tab closes. That is not an oversight — it is the whole point. The piece
// is a surveillance *metaphor*; making it literal surveillance would flatly
// contradict soulware.live's own /privacidad and /cookies pledge ("no utiliza
// cookies de seguimiento ni análisis de terceros"). Keep this class incapable
// of persisting or transmitting, forever.
//
// What it learns, so the presence at the ninth door can give it back:
//   · cadence   — the reader's own pulse between manual advances
//   · trail     — where their hand/eyes were when they advanced
//   · autoRatio — how often they let the building climb for them
//   · hesitation— the gap between a line landing and their next move

export class ReaderMemory {
  constructor() {
    this.intervals = [];        // ms between consecutive MANUAL advances
    this.hesitations = [];      // ms from a line's reveal to the next advance
    this.trail = [];            // recent {x, y} (normalized 0..1) at each advance
    this.autoCount = 0;         // times the building advanced for them
    this.manualCount = 0;       // times they advanced themselves
    this._lastManualAt = 0;
    this._lastRevealAt = 0;
    this._pointer = { x: 0.5, y: 0.5 }; // last known pointer, normalized
    this._touch = false;        // has this reader ever used touch?
    this._bind();
  }

  _bind() {
    const track = (e) => {
      this._pointer.x = e.clientX / Math.max(1, innerWidth);
      this._pointer.y = e.clientY / Math.max(1, innerHeight);
      if (e.pointerType === 'touch') this._touch = true;
    };
    addEventListener('pointermove', track, { passive: true });
    addEventListener('pointerdown', track, { passive: true });
  }

  /** A line just became readable — start the hesitation clock. */
  markReveal() { this._lastRevealAt = performance.now(); }

  /** One advance happened. `forced` = the building did it (auto-advance). */
  recordAdvance(forced) {
    const now = performance.now();

    if (forced) {
      this.autoCount++;
    } else {
      this.manualCount++;
      // Cadence is the READER's pulse — only manual advances count. Guard the
      // bounds: sub-150ms is a double-fire, multi-second is them stepping away.
      if (this._lastManualAt) {
        const dt = now - this._lastManualAt;
        if (dt > 150 && dt < 15000) this.intervals.push(dt);
      }
      this._lastManualAt = now;
      if (this._lastRevealAt) {
        const h = now - this._lastRevealAt;
        if (h > 0 && h < 15000) this.hesitations.push(h);
      }
    }

    this.trail.push({ x: this._pointer.x, y: this._pointer.y });
    if (this.trail.length > 48) this.trail.shift();
    if (this.intervals.length > 60) this.intervals.shift();
    if (this.hesitations.length > 60) this.hesitations.shift();
  }

  /**
   * The reader's pulse: the median gap between their own advances. Median, not
   * mean, so one long pause to think doesn't drag it. Falls back to a calm
   * default when there isn't enough of them yet (e.g. deep-linked in, or a
   * reader who mostly lets it auto-advance).
   */
  cadence() {
    const s = this.intervals.filter((x) => x < 12000).slice(-20);
    if (s.length < 3) return 2600;
    const sorted = [...s].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  /** 0 = always advanced themselves, 1 = always let the building do it. */
  autoRatio() {
    const total = this.autoCount + this.manualCount;
    return total ? this.autoCount / total : 0;
  }

  pointer() { return this._pointer; }
  isTouch() { return this._touch; }
}
