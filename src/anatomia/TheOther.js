// TheOther.js — the one waiting at the ninth door.
//
// "Porque habrá alguien esperándote al otro lado. Y serás tú."
//
// It has no face. It is not a silhouette drawn by us — it is the READER, played
// back. It pulses on their own cadence, drifts toward where their hand has been,
// and at the end it stops echoing and starts *leading*: it moves a beat before
// they do, then rises into a standing shape. The horror is not an image; it is
// recognition. Powered entirely by ReaderMemory.
//
// Deliberately a POINT, not a mouse cursor. GPT's version spoke in "cursor"
// language that only exists on desktop — most of our readers arrive on phones
// from Instagram, where there is no pointer to haunt. A point of light (dark,
// on the epilogue's bone-white paper) reads on touch and mouse alike; on touch
// it holds center and breathes on the tap-pulse instead of chasing a cursor
// that isn't there.

export class TheOther {
  constructor(memory) {
    this.mem = memory;
    this.el = null;
    this._pulseTimer = null;
    this._raf = null;
    this._x = 0.5;
    this._y = 0.46;
    this._lead = 0; // ms the pulse fires BEFORE the reader's expected beat
  }

  _ensure() {
    if (this.el) return this.el;
    const el = document.createElement('div');
    el.id = 'the-other';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    this.el = el;
    return el;
  }

  /** It appears, and breathes on your rhythm — a half-beat behind you. */
  birth() {
    const el = this._ensure();
    this._x = 0.5;
    this._y = 0.46;
    this._place();
    requestAnimationFrame(() => el.classList.add('on'));
    this._lead = 0;
    this._startPulse();
    this._startFollow(0.03); // heavy lag: it trails your hand
  }

  /** "Y serás tú." — it stops echoing and leads: pulses before you, chases
   *  ahead of your hand, and rises into your shape. */
  take() {
    const el = this._ensure();
    this._lead = 150; // the click that comes before the click
    this._startPulse();
    this._startFollow(0.11, true); // sharper, anticipatory
    setTimeout(() => el.classList.add('forma'), 850);
  }

  _place() {
    if (!this.el) return;
    this.el.style.left = `${this._x * 100}%`;
    this.el.style.top = `${this._y * 100}%`;
  }

  // A pulse every cadence(), optionally fired `_lead` ms early so it lands just
  // before the reader's own next advance. setTimeout (not rAF) so it keeps
  // beating even while the tab is backgrounded.
  _startPulse() {
    clearTimeout(this._pulseTimer);
    const beat = () => {
      if (this.el) {
        this.el.classList.add('beat');
        setTimeout(() => this.el && this.el.classList.remove('beat'), 240);
      }
      const c = Math.max(700, this.mem.cadence() - this._lead);
      this._pulseTimer = setTimeout(beat, c);
    };
    const first = Math.max(320, this.mem.cadence() - this._lead);
    this._pulseTimer = setTimeout(beat, first);
  }

  // Desktop: drift toward the reader's pointer. When anticipating, aim slightly
  // ahead along their recent motion so it arrives where their hand is going.
  // Touch: there is no pointer to chase — it stays put and lets the pulse carry
  // the uncanniness.
  _startFollow(ease, anticipate = false) {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this.mem.isTouch()) return;
    const step = () => {
      this._raf = requestAnimationFrame(step);
      const p = this.mem.pointer();
      let tx = p.x, ty = p.y;
      if (anticipate) {
        const tr = this.mem.trail;
        if (tr.length >= 2) {
          const a = tr[tr.length - 2], b = tr[tr.length - 1];
          tx = Math.min(1, Math.max(0, p.x + (b.x - a.x) * 1.5));
          ty = Math.min(1, Math.max(0, p.y + (b.y - a.y) * 1.5));
        }
      }
      this._x += (tx - this._x) * ease;
      this._y += (ty - this._y) * ease;
      this._place();
    };
    step();
  }

  dismiss() {
    clearTimeout(this._pulseTimer);
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.el?.classList.remove('on', 'beat', 'forma');
  }
}
