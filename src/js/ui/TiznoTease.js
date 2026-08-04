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

    // mensajes del marco: rueda (scroll), estado de la llamada y textos
    this._hablarBtn = document.getElementById('hablar-tizno-btn');
    this._hablarBtn?.addEventListener('click', () => this._enviar({ tipo: 'hablar' }));
    window.addEventListener('message', (ev) => {
      if (ev.origin !== location.origin || !ev.data) return;
      const m = ev.data;
      if (m.tipo === 'ai') {
        // la etiqueta del botón sigue el estado real de la llamada
        this._llamando = m.estado !== 'idle';
        const span = this._hablarBtn?.querySelector('span');
        if (span) span.textContent = t(this._llamando ? 'footer.colgar' : 'footer.hablar');
      } else if (m.tipo === 'estado' && this._susurroEl()) {
        const el = this._susurroEl();
        el.textContent = m.texto;
        el.classList.add('visible');
        clearTimeout(this._susurroT);
        this._susurroT = setTimeout(() => el.classList.remove('visible'), 4000);
      }
    });
  }

  _liberar() {
    // el miedo al candado se arma cuando el cursor SALE del botón: si no,
    // aparecía ya enfadado (el ratón está sobre el botón al liberarlo)
    this._candadoArmado = false;
    if (!this._frame) {
      this._frame = document.createElement('iframe');
      this._frame.id = 'tizno-frame';
      this._frame.src = '/tizno-ai.html?embed=1';
      this._frame.title = 'Tizno';
      this._frame.setAttribute('allow', 'microphone');   // fase 3: la voz
      this._frame.setAttribute('allowtransparency', 'true');
      document.body.appendChild(this._frame);
      this._frame.addEventListener('load', () => {
        this._enviar({ tipo: 'liberar' });
        // el marco nace invisible: sin esto, el primer pintado del iframe
        // metía un destello de ventana en blanco durante unos ms
        setTimeout(() => this._frame.classList.add('visible'), 150);
      }, { once: true });

      // reenvío de ratón a ~30 fps + lo que teme (candado) y lo que ama
      // (portadas y cofres de compra) — distancias en px físicos
      this._gustos = [...document.querySelectorAll('.obra-cover, .obra-editions--shop')];
      window.addEventListener('mousemove', (e) => {
        const ahora = performance.now();
        if (ahora - this._ultimoEnvio < 16 || !this._libre) return;
        this._ultimoEnvio = ahora;
        const r = this._candado.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const dCandado = Math.hypot(dx, dy);
        if (!this._candadoArmado && dCandado > 110) this._candadoArmado = true;
        // ¿está el cursor sobre (o rozando) algo que le gusta?
        let gusto = 1e9, gx = 0, gy = 0;
        const fr = this._frame.getBoundingClientRect();
        const tx = fr.left + fr.width / 2, ty = fr.top + fr.height * 0.7;
        for (const el of this._gustos) {
          const g = el.getBoundingClientRect();
          if (!g.width) continue;
          const ddx = e.clientX - Math.max(g.left, Math.min(e.clientX, g.right));
          const ddy = e.clientY - Math.max(g.top, Math.min(e.clientY, g.bottom));
          const d = Math.hypot(ddx, ddy);   // 0 dentro del elemento
          if (d < gusto) { gusto = d; gx = (g.left + g.width / 2 - tx) / 400; gy = (g.top + g.height / 2 - ty) / 400; }
        }
        this._enviar({
          tipo: 'raton', x: e.clientX, y: e.clientY,
          candadoDist: this._candadoArmado ? dCandado : 1000,
          candadoNX: Math.max(-1, Math.min(1, dx / 200)),
          candadoNY: Math.max(-1, Math.min(1, dy / 200)),
          gustoDist: gusto,
          gustoNX: Math.max(-1, Math.min(1, gx)),
          gustoNY: Math.max(-1, Math.min(1, gy)),
        });
      }, { passive: true });
      // el marco es transparente a eventos: los clics sobre su zona se reenvían
      window.addEventListener('click', (e) => {
        if (!this._libre || !this._frame) return;
        const fr = this._frame.getBoundingClientRect();
        if (e.clientX >= fr.left && e.clientX <= fr.right && e.clientY >= fr.top && e.clientY <= fr.bottom) {
          this._enviar({ tipo: 'clic', x: e.clientX, y: e.clientY });
        }
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

  _susurroEl() { return document.getElementById('liberar-susurro'); }

  _pintarCandado() {
    const span = this._candado?.querySelector('span');
    if (span) span.textContent = t(this._libre ? 'footer.encerrar' : 'footer.liberar');
    this._candado?.classList.toggle('abierto', this._libre);
    this._candado?.setAttribute('aria-label', t(this._libre ? 'footer.encerrar-aria' : 'footer.liberar-aria'));
    // el botón de hablar existe SOLO con Tizno libre, y siempre renace en 'Hablarle'
    if (this._hablarBtn) {
      this._hablarBtn.hidden = !this._libre;
      this._llamando = false;
      const hs = this._hablarBtn.querySelector('span');
      if (hs) hs.textContent = t('footer.hablar');
    }
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
