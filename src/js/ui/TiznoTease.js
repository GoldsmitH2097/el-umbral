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
    this._panel      = document.getElementById('contact-popover');
    this._navBtn     = document.getElementById('nav-contacto');
    this._candado    = document.getElementById('liberar-tizno-btn');
    this._susurro    = document.getElementById('liberar-susurro');
    this._open       = false;
    this._susurroT   = null;
  }

  init() {
    // main.js llama a init() desde DOS rutas de arranque (intro y salto):
    // sin este pestillo cada botón recibía dos listeners y un clic hacía
    // toggle doble — abrir y cerrar en el mismo gesto.
    // OJO: el clic del CONTACTO de la cabecera NO se cablea aquí — lo
    // despacha ArchiveDOM vía [data-action="scroll-contact"] → toggle().
    if (this._inited || !this._panel) return;
    this._inited = true;
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this._open) this.close(); });
    // clic fuera del panelito = cerrarlo
    document.addEventListener('click', e => {
      if (this._open && !e.target.closest('#contact-popover, #nav-contacto')) this.close();
    });

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
    if (!this._panel) return;
    this._open = true;
    this._panel.hidden = false;
    // reflow forzado antes de la clase: la transición anima. Síncrono — nada
    // de rAF, que hay entornos que lo estrangulan.
    void this._panel.offsetHeight;
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
