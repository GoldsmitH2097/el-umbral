/**
 * TiznoTease.js — el cajón/popover de contacto + EL CANDADO DE TIZNO (fase 2).
 *
 * El candado ya no traquetea en vano: invoca. Al primer clic se crea un
 * iframe lazy con /tizno-ai.html?embed=1 (transparente, escalado, sin UI de
 * demo) y se le ordena el pop-in. El mismo botón encierra: pop-out y el
 * marco queda dormido (sueño profundo del motor = coste cero).
 *
 * La madre reenvía el ratón de TODA la página (para que Tizno lo siga desde
 * su esquina) y la distancia del cursor al candado — que hereda el papel de
 * "botón temido" del demo. La rueda sobre el marco vuelve como scroll.
 *
 * getPosition() sigue devolviendo el candado: es lo que orbita la
 * luciérnaga-compañera.
 */

import { t } from '../core/i18n.js';

export class TiznoTease {
  constructor() {
    this._panel   = document.getElementById('contact-popover');
    this._navBtn  = document.getElementById('nav-contacto');
    this._candado = document.getElementById('liberar-tizno-btn');
    this._open    = false;
    this._frame   = null;
    this._libre   = false;
    this._ultimoEnvio = 0;
  }

  init() {
    // main.js llama a init() desde DOS rutas de arranque: pestillo obligatorio.
    if (this._inited || !this._panel) return;
    this._inited = true;
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this._open) this.close(); });
    document.addEventListener('click', e => {
      if (this._open && !e.target.closest('#contact-popover, #nav-contacto')) this.close();
    });

    this._candado?.addEventListener('click', () => this._libre ? this._encerrar() : this._liberar());

    // la rueda sobre el marco de Tizno vuelve como scroll de la página
    window.addEventListener('message', (ev) => {
      if (ev.origin !== location.origin || ev.data?.tipo !== 'rueda') return;
      document.getElementById('main-site')?.scrollBy({ top: ev.data.dy });
    });
  }

  _liberar() {
    if (!this._frame) {
      this._frame = document.createElement('iframe');
      this._frame.id = 'tizno-frame';
      this._frame.src = '/tizno-ai.html?embed=1';
      this._frame.title = 'Tizno';
      this._frame.setAttribute('allow', 'microphone');   // fase 3: la voz
      document.body.appendChild(this._frame);
      this._frame.addEventListener('load', () => this._enviar({ tipo: 'liberar' }), { once: true });

      // reenvío de ratón a ~30 fps + distancia al candado (el botón temido)
      window.addEventListener('mousemove', (e) => {
        const ahora = performance.now();
        if (ahora - this._ultimoEnvio < 33 || !this._libre) return;
        this._ultimoEnvio = ahora;
        const r = this._candado.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        this._enviar({
          tipo: 'raton', x: e.clientX, y: e.clientY,
          candadoDist: Math.hypot(dx, dy),
          candadoNX: Math.max(-1, Math.min(1, dx / 200)),
          candadoNY: Math.max(-1, Math.min(1, dy / 200)),
        });
      }, { passive: true });
    } else {
      this._enviar({ tipo: 'liberar' });
    }
    this._libre = true;
    this._pintarCandado();
  }

  _encerrar() {
    this._enviar({ tipo: 'encerrar' });
    this._libre = false;
    this._pintarCandado();
  }

  _pintarCandado() {
    const span = this._candado?.querySelector('span');
    if (span) span.textContent = t(this._libre ? 'footer.encerrar' : 'footer.liberar');
    this._candado?.classList.toggle('abierto', this._libre);
    this._candado?.setAttribute('aria-label', t(this._libre ? 'footer.encerrar-aria' : 'footer.liberar-aria'));
  }

  /** La posición de la luciérnaga compañera, a ~20 Hz (la llaman a 30). */
  enviarLuciernaga(x, y) {
    const ahora = performance.now();
    if (ahora - (this._ultimaLuci || 0) < 50) return;
    this._ultimaLuci = ahora;
    this._enviar({ tipo: 'luciernaga', x, y });
  }

  _enviar(m) {
    try { this._frame?.contentWindow?.postMessage(m, location.origin); } catch (_) {}
  }

  estaLibre() { return this._libre; }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    if (!this._panel) return;
    this._open = true;
    this._panel.hidden = false;
    void this._panel.offsetHeight;   // reflow: la transición anima
    this._panel.classList.add('open');
    this._navBtn?.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this._panel) return;
    this._open = false;
    this._panel.classList.remove('open');
    this._navBtn?.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!this._open) this._panel.hidden = true; }, 320);
  }

  /** El punto que ronda la luciérnaga-compañera: el candado. */
  getPosition() {
    const r = this._candado?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  isOpen() { return this._open; }
}
