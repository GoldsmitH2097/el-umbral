// effects.js — beat-level fx implementations. Spec: ENGINEERING.md §5.
// Phase 2: full vocabulary. ctx = { stage, scene, carta } provided by the engine.
// Hard rule: Germán's text is canon — transient glyph play must always settle
// on the exact original string.

const CSS_ONLY = new Set([
  'fade', 'cut', 'whisper', 'slam', 'clock', 'friccion', 'mirror', 'vaho',
  'estira', 'comprimida', 'oscuridad', 'interfaz',
  // Prologue art pass — pure CSS verbs
  'cabalga', 'recuerdo', 'optimizado', 'lapida', 'rictus', 'arcada', 'cierre',
  // v2: weirder, bolder
  'infeccion', 'hueco', 'medio', 'hueco-suave', 'invertido', 'latido',
  'torcido', 'brasa', 'metronomo', 'cae', 'campana', 'pasos', 'plano',
  'sonambulo', 'acerca', 'encoge',
]);

// Wrap a target substring in a styled span (word-level register shifts).
function _wrapWord(el, regex, cls) {
  el.innerHTML = el.textContent.replace(regex, `<span class="${cls}">$1</span>`);
}

export function applyFx(el, beat, ctx = {}) {
  let fx = beat.fx || 'fade';
  // Carta mode: default entrances become typewriter — the letter is being written.
  if (fx === 'fade' && ctx.carta) fx = 'carta-type';

  if (CSS_ONLY.has(fx)) { el.classList.add(`fx-${fx}`); return; }

  el.classList.add(`fx-${fx}`);
  switch (fx) {
    case 'cadence':    _cadence(el); break;
    case 'obturar':    _obturar(el); break;
    case 'corrige':    _corrige(el); break;
    case 'cuenta':     _cuenta(el); break;
    case 'rewrite':    _rewrite(el); break;
    case 'amputada':   _amputada(el); break;
    case 'etiquetas':  _etiquetas(el); break;
    case 'eco':        _eco(el); break;
    case 'inversion':  _inversion(el, ctx); break;
    case 'replay':     _replay(el); break;
    case 'blink':      _blink(el, ctx); break;
    case 'vaho-write': _vahoWrite(el); break;
    case 'umbral':     _umbral(el); break;
    case 'reproduce':  _reproduce(el); break;
    case 'carta-type': _typewriter(el); break;
    case 'breath-in':  _breath(ctx.stage, 1.012); el.classList.add('fx-fade'); break;
    case 'breath-out': _breath(ctx.stage, 0.988); el.classList.add('fx-fade'); break;
    case 'breath-stop': _breathStop(ctx.stage); el.classList.add('fx-cut'); break;
    case 'breath-cycle': _breathCycle(ctx.stage); el.classList.add('fx-fade'); break;
    case 'desviado':
      ctx.stage?.classList.add('desviado'); // engine clears it on floor start
      el.classList.add('fx-fade');
      break;
    case 'de-humo':    _deHumo(el); break;
    case 'limpia':     _limpia(el); break;
    case 'gravedad':   _gravedad(el); break;
    case 'eutanasia':  el.classList.add('fx-fade'); _wrapWord(el, /(eutanasia)/i, 'moribunda'); break;
    case 'vacio-hueco': el.classList.add('fx-fade'); _wrapWord(el, /(vacío)/i, 'hueca'); break;
    case 'esperanza-hueca': el.classList.add('fx-fade'); _wrapWord(el, /(esperanza)/i, 'hueca'); break;
    case 'verbo-mono': el.classList.add('fx-fade'); _wrapWord(el, /(verbo)/i, 'pantalla'); break;
    case 'codigo-mono': el.classList.add('fx-fade'); _wrapWord(el, /(código)/i, 'pantalla'); break;
    case 'absorcion':  _absorcion(el); break;
    case 'deslizas':   _deslizas(el); break;
    case 'perfil':     _perfil(el); break;
    case 'epitafio':   _epitafio(el); break;
    case 'ataud':      el.classList.add('fx-fade'); break; // border via .fx-ataud
    case 'quiebra':    _quiebra(el); break;
    case 'ausencia':   _ausencia(el); break;
    case 'arrastre':   _arrastre(el); break;
    case 'foco':       _foco(el); break;
    case 'acelera': case 'carrera':
      el.classList.add('fx-fade'); // pacing handled by the engine
      break;
    default:
      el.classList.add('fx-fade');
  }
}

// ── Text choreography ────────────────────────────────────────────────────────

function _cadence(el) {
  const text = el.textContent;
  const parts = text.match(/[^.!?…]+[.!?…]+["”]?\s*/g) || [text];
  const frags = parts.length > 1 ? parts : text.split(/(?<= )/);
  el.textContent = '';
  frags.forEach((frag, i) => {
    const span = document.createElement('span');
    span.className = 'cad';
    span.style.setProperty('--i', i);
    span.textContent = frag.trimEnd();
    el.appendChild(span);
    if (i < frags.length - 1) el.appendChild(document.createTextNode(' '));
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
      s.style.transform = `translateX(${cx - (r.left + r.width / 2)}px) scale(0.05)`;
    });
    el.classList.add('collapsed');
    setTimeout(() => dot.classList.add('on'), 700);
  }, 500);
}

const GLYPHS = '▚▞▟#$%&?/\\|@¬';
function _corrige(el) {
  const clean = el.textContent;
  const corrupt = (r) => [...clean].map(ch =>
    ch !== ' ' && Math.random() < r ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : ch).join('');
  el.textContent = corrupt(0.3);
  el.style.opacity = '1';
  setTimeout(() => { el.textContent = corrupt(0.15); }, 400);
  setTimeout(() => { el.textContent = corrupt(0.05); }, 650);
  setTimeout(() => { el.textContent = clean; }, 900);
}

// "Cuento." — glyphs flicker through digits before settling true. Numbers
// misbehave; the text always lands canon.
function _cuenta(el) {
  const clean = el.textContent;
  const digits = '0123456789';
  const noise = (r) => [...clean].map(ch =>
    ch !== ' ' && Math.random() < r ? digits[(Math.random() * 10) | 0] : ch).join('');
  el.style.opacity = '1';
  el.textContent = noise(0.5);
  setTimeout(() => { el.textContent = noise(0.3); }, 350);
  setTimeout(() => { el.textContent = noise(0.15); }, 620);
  setTimeout(() => { el.textContent = clean; }, 900);
}

// "No cambia. Se reescribe." — types, unwrites itself, types again. Same words.
function _rewrite(el) {
  const text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  let i = 0;
  const type = () => {
    if (i <= text.length) { el.textContent = text.slice(0, i++); setTimeout(type, 26); }
    else setTimeout(erase, 500);
  };
  const erase = () => {
    if (i >= 0) { el.textContent = text.slice(0, i--); setTimeout(erase, 14); }
    else setTimeout(retype, 300);
  };
  let j = 0;
  const retype = () => {
    if (j <= text.length) { el.textContent = text.slice(0, j++); setTimeout(retype, 26); }
  };
  type();
}

// 'Intento decir "Sofía".' — the word is amputated mid-keystroke: "Sof—"
function _amputada(el) {
  const text = el.textContent;
  const cut = text.indexOf('Sofía');
  const stopAt = cut >= 0 ? cut + 3 : Math.floor(text.length * 0.6);
  el.textContent = '';
  el.style.opacity = '1';
  let i = 0;
  const type = () => {
    if (i < stopAt) { el.textContent = text.slice(0, ++i); setTimeout(type, 55); }
    else { el.textContent = text.slice(0, stopAt) + '—'; } // the file never completes
  };
  type();
}

// Words render as UI label chips — the horror of language becoming interface.
function _etiquetas(el) {
  const text = el.textContent;
  const quoted = text.match(/[“"][^”"]+[”"]\.?/g);
  const tokens = quoted || text.split(/(?<=\.)\s+/);
  el.textContent = '';
  tokens.forEach((tok, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.style.setProperty('--i', i);
    chip.textContent = tok.replace(/[“”"]/g, '');
    el.appendChild(chip);
    if (i < tokens.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el.style.opacity = '1';
}

// The line re-renders fading behind itself — an echo that isn't ours.
function _eco(el) {
  el.classList.add('fx-fade');
  const mk = (dy, op, blur) => {
    const c = document.createElement('span');
    c.className = 'eco-layer';
    c.textContent = el.textContent;
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = `transform:translateY(${dy}px);opacity:${op};filter:blur(${blur}px)`;
    return c;
  };
  setTimeout(() => { el.appendChild(mk(6, 0.28, 1)); el.appendChild(mk(12, 0.12, 2)); }, 900);
}

// "Blanco." — one beat of black-on-white. Used once.
function _inversion(el, ctx) {
  el.classList.add('fx-cut', 'inverted');
  ctx.scene?.whiteFlash(420);
  setTimeout(() => el.classList.remove('inverted'), 430);
}

// "Esto ya ha pasado." — the previous line flickers back, twice.
function _replay(el) {
  el.classList.add('fx-fade');
  const prev = el.previousElementSibling;
  if (!prev) return;
  const flick = () => {
    prev.style.transition = 'none';
    const orig = prev.style.opacity;
    prev.style.opacity = '0.5';
    setTimeout(() => { prev.style.opacity = orig || ''; }, 130);
  };
  setTimeout(flick, 600);
  setTimeout(flick, 1100);
}

// "Parpadeo." — the reader blinks with him.
function _blink(el, ctx) {
  ctx.scene?.blink(150);
  el.classList.add('fx-cut');
}

// EL TIEMPO NO EXISTE — exhaled onto the glass, one breath-stroke at a time.
function _vahoWrite(el) {
  const text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'vw';
    s.style.setProperty('--i', i);
    s.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(s);
  });
}

// "Solo existe este umbral." — the brand word, in amber, once.
function _umbral(el) {
  el.classList.add('fx-fade');
  el.innerHTML = el.textContent.replace(/(umbral)/i, '<span class="umbral-word">$1</span>');
}

// "Una y otra vez. Una y otra vez. Una y otra vez." — renders itself 3×.
function _reproduce(el) {
  el.style.opacity = '1';
  const show = (n) => {
    el.style.opacity = '1';
    if (n < 2) {
      setTimeout(() => { el.style.opacity = '0'; }, 500);
      setTimeout(() => show(n + 1), 700);
    }
  };
  show(0);
}

// Carta mode default: the letter is being typed as you watch.
function _typewriter(el) {
  const text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  let i = 0;
  const type = () => {
    if (i <= text.length) { el.textContent = text.slice(0, i++); setTimeout(type, 24); }
  };
  setTimeout(type, 250);
}

// ── Prologue art pass ────────────────────────────────────────────────────────

// "La singularidad le está llegando." — smoke condenses into letters.
// Each glyph starts scattered, blurred, adrift — and settles into the word.
function _deHumo(el) {
  const text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'dh';
    s.style.setProperty('--dx', `${(Math.random() - 0.5) * 70}px`);
    s.style.setProperty('--dy', `${-15 - Math.random() * 45}px`);
    s.style.setProperty('--d', `${i * 40 + Math.random() * 200}ms`);
    s.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(s);
  });
}

// "Limpia. Silenciosa. Correcta." — each word arrives CLEANER than the last:
// rough, then focused, then razor-sharp with a cold brightness. No sound.
function _limpia(el) {
  const words = el.textContent.split(/\s+/);
  el.textContent = '';
  el.style.opacity = '1';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = `lmp lmp-${i}`;
    s.style.setProperty('--i', i);
    s.textContent = w;
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

// "El agujero negro no está en el cielo." — the fragments FALL into place,
// pulled down by something below the text.
function _gravedad(el) {
  _cadence(el);
  el.querySelectorAll('.cad').forEach(s => s.classList.add('cad-gravedad'));
}

// "Se es absorbido." — the PREVIOUS line is sucked into the center and gone.
function _absorcion(el) {
  el.classList.add('fx-fade');
  const prev = el.previousElementSibling;
  if (!prev || prev.classList.contains('pending')) return;
  setTimeout(() => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const r = prev.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    prev.style.transition = 'transform 1.3s cubic-bezier(0.6,0,0.9,1), opacity 1.3s ease, filter 1.3s ease';
    prev.style.transform = `translate(${dx}px, ${dy}px) scale(0.02)`;
    prev.style.opacity = '0';
    prev.style.filter = 'blur(2px)';
  }, 700);
}

// "Ahora gestionas. Deslizas. Aceptas. Repites." — each word performs its verb:
// notification / swipe-away / button-press / stutter. UI gestures invading prose.
function _deslizas(el) {
  const words = el.textContent.split(/\s+/);
  el.textContent = '';
  el.style.opacity = '1';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = `ds ds-${i}`;
    s.style.setProperty('--i', i);
    s.textContent = w;
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

// "…su versión mejorada: el perfil." — a ghost of the line slides over the
// original, misaligned by three pixels; the words "el perfil" themselves
// switch to interface type. SAME font for the ghost — identical metrics,
// identical wrap, no layout bleed (the v1 system-font ghost wrapped
// differently and overlapped the next line).
function _perfil(el) {
  el.classList.add('fx-fade');
  _wrapWord(el, /(el perfil)/i, 'pantalla');
  setTimeout(() => {
    const ghost = document.createElement('span');
    ghost.className = 'perfil-ghost';
    ghost.innerHTML = el.innerHTML;
    ghost.setAttribute('aria-hidden', 'true');
    el.style.position = 'relative';
    el.appendChild(ghost);
  }, 1200);
}

// "…ya no se escribe en piedra, sino sobre pantalla." — the sentence changes
// register mid-line: the screen half renders in interface type.
function _epitafio(el) {
  el.classList.add('fx-fade');
  el.innerHTML = el.textContent.replace(/(sobre pantalla)/i, '<span class="pantalla">$1</span>');
}

// "Se quiebra el mineral." — the paragraph fractures: two halves, hairline off.
function _quiebra(el) {
  const text = el.textContent;
  el.classList.add('fx-fade');
  el.textContent = '';
  el.style.position = 'relative';
  const mk = (clip, dx) => {
    const s = document.createElement('span');
    s.className = 'quiebra-half';
    s.textContent = text;
    s.style.clipPath = clip;
    s.style.transform = `translateX(${dx}px)`;
    return s;
  };
  const top = mk('inset(0 0 48% 0)', 0);
  const bottom = mk('inset(52% 0 0 0)', 0);
  bottom.style.position = 'absolute';
  bottom.style.inset = '0';
  el.appendChild(top);
  el.appendChild(bottom);
  setTimeout(() => { bottom.style.transform = 'translateX(1.6px)'; top.style.transform = 'translateX(-0.8px)'; }, 1400);
}

// "Un compuesto estable de ausencia." — the last word is present but absent.
function _ausencia(el) {
  el.classList.add('fx-fade');
  const words = el.textContent.trim().split(/\s+/);
  const last = words[words.length - 1];
  el.innerHTML = el.textContent.replace(new RegExp(`(${last.replace('.', '\\.')})$`), '<span class="ausente">$1</span>');
}

// "Te lleva. Te arrastra. Te organiza." — the fragments are dragged into place.
function _arrastre(el) {
  _cadence(el);
  el.querySelectorAll('.cad').forEach(s => s.classList.add('cad-arrastre'));
}

// "entiendes." — everything else dims; the word alone holds the light.
function _foco(el) {
  el.classList.add('fx-fade', 'foco');
  [...el.parentElement.children].forEach(sib => {
    if (sib !== el && !sib.classList.contains('pending')) sib.classList.add('foco-dim');
  });
}

// ── Breath — the viewport itself inhales. Halts on "No entra." ─────────────

function _breath(stage, scale) {
  if (!stage) return;
  stage.style.transition = 'transform 1.6s ease-in-out';
  stage.style.transform = `scale(${scale})`;
}

function _breathStop(stage) {
  if (!stage) return;
  const current = getComputedStyle(stage).transform;
  stage.style.transition = 'none';
  stage.style.transform = current === 'none' ? '' : current; // freeze mid-breath
  setTimeout(() => {
    stage.style.transition = 'transform 0.9s ease-out';
    stage.style.transform = 'scale(1)';
  }, 400);
}

function _breathCycle(stage) {
  if (!stage) return;
  _breath(stage, 1.012);
  setTimeout(() => _breath(stage, 0.988), 1800);
  setTimeout(() => { stage.style.transform = 'scale(1)'; }, 3600);
}

// ── The wipe — the reader's only physical act ───────────────────────────────
// "Paso el dedo." A canvas clone of the vaho text sits over the stage; the
// pointer erases it. ≥60 % gone → onComplete. Tap-skippable after 6 s (a11y).

export function startWipe(vahoEl, onComplete) {
  if (!vahoEl) { onComplete(); return () => {}; }
  const rect = vahoEl.getBoundingClientRect();
  const pad = 30;
  const canvas = document.createElement('canvas');
  canvas.id = 'wipe-canvas';
  canvas.width = rect.width + pad * 2;
  canvas.height = rect.height + pad * 2;
  canvas.style.cssText =
    `position:fixed;left:${rect.left - pad}px;top:${rect.top - pad}px;` +
    `width:${canvas.width}px;height:${canvas.height}px;z-index:9;touch-action:none;`;
  const ctx = canvas.getContext('2d');

  // Paint the same text into the canvas, then hide the DOM original.
  const cs = getComputedStyle(vahoEl);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fillStyle = cs.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.filter = 'blur(1.5px)';
  const lines = [vahoEl.textContent];
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, canvas.height / 2 + i * parseFloat(cs.lineHeight || 40),
      canvas.width - pad);
  });
  vahoEl.style.visibility = 'hidden';
  document.body.appendChild(canvas);

  let erased = 0;
  const total = canvas.width * canvas.height;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    canvas.style.transition = 'opacity 0.9s ease';
    canvas.style.opacity = '0';
    setTimeout(() => canvas.remove(), 950);
    clearTimeout(fallback);
    onComplete();
  };

  let drawing = false;
  const erase = (e) => {
    if (!drawing) return;
    const r = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'none';
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 34, 0, Math.PI * 2);
    ctx.fill();
    erased += Math.PI * 34 * 34 * 0.4; // generous estimate; overlap-safe enough
    if (erased > total * 0.6) finish();
  };
  canvas.addEventListener('pointerdown', (e) => { drawing = true; erase(e); });
  canvas.addEventListener('pointermove', erase);
  addEventListener('pointerup', () => { drawing = false; }, { once: false });

  // A11y / impatience: after 6 s a tap anywhere completes it.
  const fallback = setTimeout(() => {
    canvas.addEventListener('click', finish);
    document.getElementById('hint')?.classList.add('on');
    const hint = document.getElementById('hint');
    if (hint) hint.textContent = 'borra el vaho';
  }, 6000);

  return finish; // engine can force-complete (reduced-motion path)
}
