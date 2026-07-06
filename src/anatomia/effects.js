// effects.js — beat-level fx implementations. Spec: ENGINEERING.md §5.
// Phase 1 set: fade, cut, whisper, slam, cadence, obturar, corrige, friccion, clock.
// Unimplemented fx fall back to fade (logged in dev) — Phase 2 fills the table.

const PHASE1 = new Set(['fade', 'cut', 'whisper', 'slam', 'cadence', 'obturar', 'corrige', 'friccion', 'clock']);

export function applyFx(el, beat) {
  const fx = beat.fx || 'fade';
  const impl = PHASE1.has(fx) ? fx : 'fade';
  if (impl !== fx && import.meta.env.DEV) console.debug(`[anatomia] fx "${fx}" pending Phase 2 — fade fallback`);
  el.classList.add(`fx-${impl}`);

  switch (impl) {
    case 'cadence': _cadence(el); break;
    case 'obturar': _obturar(el); break;
    case 'corrige': _corrige(el); break;
  }
}

// Split into sentences (or words when the beat is a single sentence) and
// stagger each fragment's entrance via the --i custom property.
function _cadence(el) {
  const text = el.textContent;
  const parts = text.match(/[^.!?…]+[.!?…]+["”]?\s*/g) || [text];
  const frags = parts.length > 1 ? parts : text.split(/(?<= )/);
  el.textContent = '';
  frags.forEach((frag, i) => {
    const span = document.createElement('span');
    span.className = 'cad';
    span.style.setProperty('--i', i);
    span.textContent = frag;
    el.appendChild(span);
  });
}

// "Obtura." — the letters get pulled into a single black point that persists.
function _obturar(el) {
  const text = el.textContent;
  el.textContent = '';
  const spans = [...text].map(ch => {
    const s = document.createElement('span');
    s.className = 'ltr';
    s.textContent = ch;
    // Non-breaking space keeps inline-block spans from collapsing whitespace
    if (ch === ' ') s.innerHTML = '&nbsp;';
    el.appendChild(s);
    return s;
  });
  const dot = document.createElement('span');
  dot.className = 'obt-dot';
  el.appendChild(dot);

  setTimeout(() => {
    const mid = el.getBoundingClientRect();
    const cx = mid.left + mid.width / 2;
    spans.forEach(s => {
      const r = s.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      s.style.transform = `translateX(${dx}px) scale(0.05)`;
    });
    el.classList.add('collapsed');
    setTimeout(() => dot.classList.add('on'), 700);
  }, 500);
}

// "Te corrige. Te pule. Te vuelve legible." — appears corrupted, snaps clean
// in three steps. Correction as horror: the glitch is the ORIGINAL state.
const GLYPHS = '▚▞▟#$%&?/\\|@¬';
function _corrige(el) {
  const clean = el.textContent;
  const corrupt = (ratio) => [...clean].map(ch =>
    ch !== ' ' && Math.random() < ratio ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : ch
  ).join('');
  el.textContent = corrupt(0.3);
  el.style.opacity = '1';
  setTimeout(() => { el.textContent = corrupt(0.15); }, 400);
  setTimeout(() => { el.textContent = corrupt(0.05); }, 650);
  setTimeout(() => { el.textContent = clean; }, 900);
}
