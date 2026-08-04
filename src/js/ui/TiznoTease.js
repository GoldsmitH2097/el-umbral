/**
 * TiznoTease.js — el cajón de contacto del footer + el candado de Tizno.
 *
 * Antes: el teaser de ojos estilo Hollow Knight con un panel modal.
 * Ahora (fase 1 del footer del Umbral, Ruben 2026-08-04): el contenido del
 * panel vive en un cajón desplegable DENTRO del footer, y el teaser son las
 * luciérnagas rondando el candado. La clase conserva su nombre y su contrato
 * (init/open/close/toggle/getPosition/isOpen) para no tocar a sus llamantes.
 *
 * getPosition() ahora devuelve el centro del CANDADO: es el punto que orbita
 * la luciérnaga-compañera como invitación a pulsarlo.
 *
 * Fase 2 cableará el candado al pop-in real de Tizno; de momento la cerradura
 * se resiste con un traqueteo y un susurro.
 */

export class TiznoTease {
  constructor() {
    this._cajon      = document.getElementById('footer-contacto');
    this._contactBtn = document.getElementById('footer-contacto-btn');
    this._candado    = document.getElementById('liberar-tizno-btn');
    this._susurro    = document.getElementById('liberar-susurro');
    this._open       = false;
    this._susurroT   = null;
  }

  init() {
    // main.js llama a init() desde DOS rutas de arranque (intro y salto):
    // sin este pestillo cada botón recibía dos listeners y un clic hacía
    // toggle doble — abrir y cerrar en el mismo gesto.
    if (this._inited || !this._cajon) return;
    this._inited = true;
    this._contactBtn?.addEventListener('click', () => this.toggle());
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this._open) this.close(); });

    // Fase 1: la cerradura resiste. Traqueteo + susurro, nada más.
    this._candado?.addEventListener('click', () => {
      this._candado.classList.remove('traqueteo');
      void this._candado.offsetWidth;          // reinicia la animación
      this._candado.classList.add('traqueteo');
      if (this._susurro) {
        this._susurro.textContent = this._susurro.dataset.texto || 'Todavía no… la cerradura resiste.';
        this._susurro.classList.add('visible');
        clearTimeout(this._susurroT);
        this._susurroT = setTimeout(() => this._susurro.classList.remove('visible'), 2600);
      }
    });
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    if (!this._cajon) return;
    this._open = true;
    this._cajon.hidden = false;
    // reflow forzado: el navegador registra el estado cerrado (max-height 0)
    // ANTES de la clase, y la transición anima. Síncrono — nada de rAF, que
    // hay entornos que lo estrangulan.
    void this._cajon.offsetHeight;
    this._cajon.classList.add('open');
    this._contactBtn?.setAttribute('aria-expanded', 'true');
    this._cajon.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  close() {
    if (!this._cajon) return;
    this._open = false;
    this._cajon.classList.remove('open');
    this._contactBtn?.setAttribute('aria-expanded', 'false');
    // espera el final de la transición antes de sacarlo del árbol accesible
    setTimeout(() => { if (!this._open) this._cajon.hidden = true; }, 450);
  }

  /** El punto que ronda la luciérnaga-compañera: el candado. */
  getPosition() {
    const r = this._candado?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  isOpen() { return this._open; }
}
