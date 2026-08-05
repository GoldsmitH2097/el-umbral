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

    /* UN GESTO, UNA ORDEN. Es un interruptor, así que un doble clic lo
       ejecutaba dos veces: encerrar y volver a liberar. La gente hace doble
       clic en los botones sin querer, y el resultado era que Tizno reaparecía
       justo cuando pretendías guardarlo. Medio segundo de sordera basta:
       nadie quiere de verdad encerrarlo y soltarlo en ese margen. */
    this._candado?.addEventListener('click', () => {
      const ahora = Date.now();
      if (ahora - (this._ultimoCandadoT || 0) < 500) return;
      this._ultimoCandadoT = ahora;
      this._libre ? this._encerrar() : this._liberar();
    });

    /* LAS SÚPLICAS DEL CANDADO (Ruben): la del preso ("dale al candado")
       ya NO vive en el hover — rozar el candado es el preludio del clic,
       así que la frase nacía condenada a que el pop de Tizno la pisara.
       Ahora es una sirena de los ratos QUIETOS (ver _latidoSuplica). El
       hover con reposo (450 ms) queda solo para el Tizno libre, que
       suplica que no le encierren — ahí el orden dramático es el bueno:
       ruega antes del clic y, si caes igual, se hunde con el ruego en la
       boca. */
    this._suplicaToma = 1;
    this._suplicaEncierroT = 0;
    this._hoverTimer = null;
    this._candado?.addEventListener('mouseenter', () => {
      clearTimeout(this._hoverTimer);
      if (!this._libre) return;
      this._hoverTimer = setTimeout(() => {
        const ahora = Date.now();
        if (ahora - this._suplicaEncierroT < 30000) return;
        this._suplicaEncierroT = ahora;
        this._enviar({ tipo: 'suplica-encierro' });
      }, 450);
    });
    this._candado?.addEventListener('mouseleave', () => clearTimeout(this._hoverTimer));

    // la sirena del preso: late cada 3 s y decide si toca susurrar
    this._suplicaAudio = null;
    this._suplicasDichas = 0;
    this._ultimaSuplicaT = 0;
    this._candadoVistoT = 0;
    this._ultimoGesto = 0;   // 0 = ni un gesto aún → el navegador vetaría el audio
    const gesto = () => { this._ultimoGesto = Date.now(); };
    window.addEventListener('pointerdown', gesto, { passive: true });
    window.addEventListener('wheel', gesto, { passive: true });
    window.addEventListener('keydown', gesto);
    window.addEventListener('scroll', gesto, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this._cortarSuplica(); });
    setInterval(() => this._latidoSuplica(), 3000);

    /* BACKSTAGE (Ruben): al abrir la vista de lectura de un libro, Tizno se
       hunde en silencio y su marco se desvanece — cero solapes con el
       contenido y cero reacciones. Al cerrarla, pop de vuelta. */
    const lectura = document.getElementById('reading-view');
    if (lectura) {
      this._enLectura = false;
      new MutationObserver(() => {
        const abierta = !lectura.hasAttribute('inert');
        if (abierta === this._enLectura) return;
        this._enLectura = abierta;
        if (abierta) this._cortarSuplica();   // que no siga "dale al candado" sobre la lectura
        if (!this._libre || !this._frame) return;
        if (abierta) {
          this._enviar({ tipo: 'ocultar' });
          this._frame.classList.add('backstage');
        } else {
          this._frame.classList.remove('backstage');
          setTimeout(() => { if (!this._enLectura && this._libre) this._enviar({ tipo: 'liberar' }); }, 350);
        }
      }).observe(lectura, { attributes: true, attributeFilter: ['inert'] });
    }

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
    // quien libera calla a la sirena: el clic corta el "dale al candado" a
    // medias (ya no está preso) y no volverá a sonar en toda la visita —
    // quien ya le soltó una vez conoce el truco
    this._cortarSuplica();
    this._yaLiberado = true;
    // el miedo al candado se arma cuando el cursor SALE del botón: si no,
    // aparecía ya enfadado (el ratón está sobre el botón al liberarlo)
    this._candadoArmado = false;
    // el estado se fija ANTES de pedir el marco: si el iframe tarda, la
    // orden que llegue al final será la del estado real (ver _sincronizar)
    this._libre = true;
    if (!this._frame) {
      this._frame = document.createElement('iframe');
      this._frame.id = 'tizno-frame';
      this._frame.src = '/tizno-ai.html?embed=1';
      this._frame.title = 'Tizno';
      this._frame.setAttribute('allow', 'microphone');   // fase 3: la voz
      this._frame.setAttribute('allowtransparency', 'true');
      /* DENTRO de #main-site: ese contenedor crea un contexto de apilamiento
         (z-index 20). Colgado de body, el marco comparaba su z contra el del
         sitio ENTERO y flotaba sobre la barra por mucho z que le diéramos.
         Como hermano del footer, 28 < 30 y la barra manda. position:fixed
         sigue siendo fiel al viewport (main-site no tiene transform). */
      (document.getElementById('main-site') || document.body).appendChild(this._frame);
      this._frame.addEventListener('load', () => {
        this._frameListo = true;
        this._sincronizarMarco();
      }, { once: true });

      // reenvío de ratón a ~30 fps + lo que teme (candado) y lo que ama
      // (portadas y cofres de compra) — distancias en px físicos
      this._gustos = [...document.querySelectorAll('.obra-cover, .obra-editions--shop')];
      window.addEventListener('mousemove', (e) => {
        const ahora = performance.now();
        if (ahora - this._ultimoEnvio < 16 || !this._libre || this._enLectura) return;
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
          /* solo cuenta PEGADO al icono: el botón de Hablar es vecino y
             rondarlo disparaba el gruñido cada dos por tres */
          candadoDist: this._candadoArmado && dCandado < 120 ? dCandado : 1000,
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
      this._sincronizarMarco();
    }
    this._pintarCandado();
  }

  _encerrar() {
    this._libre = false;
    this._sincronizarMarco();
    this._pintarCandado();
    /* Y EL MARCO SE APAGA DETRÁS DE ÉL. El iframe lleva su propia luz de
       ambiente horneada (un óvalo cálido sobre el negro), así que al hundirse
       Tizno quedaba flotando su halo: una mancha rectangular tenue donde
       antes estaba. Se espera a que termine de hundirse y entonces se
       desvanece el marco entero. El testigo evita que, si le liberan durante
       esa espera, el apagado le caiga encima. */
    const testigo = this._ocultarToken = (this._ocultarToken || 0) + 1;
    setTimeout(() => {
      if (this._ocultarToken === testigo && !this._libre) this._frame?.classList.remove('visible');
    }, 1200);
  }

  /* EL PESTILLO CONTRA EL DESFASE: crear el iframe tarda, y cualquier
     orden enviada mientras carga se pierde en el vacío (el contentWindow
     aún es about:blank). Antes mandábamos "lo que se acaba de pulsar", así
     que quien liberaba y encerraba deprisa perdía el 'encerrar' y el marco,
     al terminar de cargar, ejecutaba un 'liberar' rancio: Tizno se quedaba
     fuera mientras el botón seguía diciendo LIBERAR A TIZNO. Ahora nunca
     mandamos un gesto: mandamos el ESTADO real, y solo cuando hay marco
     vivo que lo pueda oír. */
  _sincronizarMarco() {
    if (!this._frame || !this._frameListo) return;
    if (!this._libre) { this._enviar({ tipo: 'encerrar' }); return; }
    this._ocultarToken = (this._ocultarToken || 0) + 1;   // anula un apagado pendiente
    this._enviar({ tipo: 'liberar' });
    if (this._frame.classList.contains('visible')) return;
    // el marco nace invisible: sin esto, el primer pintado del iframe
    // metía un destello de ventana en blanco durante unos ms
    setTimeout(() => { if (this._libre) this._frame.classList.add('visible'); }, 150);
  }

  /* ¿Toca el susurro del preso? Solo si: preso y jamás liberado en esta
     visita, página visible, fuera de la lectura, candado en pantalla desde
     hace ≥18 s (si no, acaba de llegar al archivo), algún gesto previo
     (sin él, el navegador vetaría el play) pero ninguno en 9 s — mover el
     ratón no cuenta como trastear: clics, rueda y teclas sí. Y sin abusar:
     2 veces por visita, con 90 s entre ellas. */
  _latidoSuplica() {
    if (this._libre || this._yaLiberado || this._enLectura || document.hidden) return;
    const r = this._candado?.getBoundingClientRect();
    if (!r || !r.width) { this._candadoVistoT = 0; return; }
    const ahora = Date.now();
    if (!this._candadoVistoT) this._candadoVistoT = ahora;
    if (this._suplicasDichas >= 2 || !this._ultimoGesto) return;
    if (ahora - this._candadoVistoT < 18000) return;
    if (ahora - this._ultimoGesto < 9000) return;
    if (ahora - this._ultimaSuplicaT < 90000) return;
    this._ultimaSuplicaT = ahora;
    this._suplicasDichas++;
    try {
      const a = new Audio('/tizno-sfx/frase-sin-micro-' + this._suplicaToma + '.mp3');
      this._suplicaToma = this._suplicaToma === 1 ? 2 : 1;
      a.volume = 0.8;
      this._suplicaAudio = a;
      const pr = a.play(); if (pr) pr.catch(() => {});
    } catch (_) {}
  }

  _cortarSuplica() {
    if (!this._suplicaAudio) return;
    try { this._suplicaAudio.pause(); } catch (_) {}
    this._suplicaAudio = null;
  }

  _susurroEl() { return document.getElementById('liberar-susurro'); }

  _pintarCandado() {
    const span = this._candado?.querySelector('span');
    if (span) span.textContent = t(this._libre ? 'footer.encerrar' : 'footer.liberar');
    this._candado?.classList.toggle('abierto', this._libre);
    this._candado?.setAttribute('aria-label', t(this._libre ? 'footer.encerrar-aria' : 'footer.liberar-aria'));
    /* Coreografía (Ruben): preso → un solo botón LIBERAR A TIZNO.
       Libre → [candado icono] [Hablar con Tizno]. Encerrar lo pliega todo. */
    if (this._hablarBtn) {
      this._hablarBtn.hidden = !this._libre;
      this._llamando = false;
      const hs = this._hablarBtn.querySelector('span');
      if (hs) hs.textContent = t('footer.hablar');
    }
  }

  /** La posición de la luciérnaga compañera, a ~20 Hz (la llaman a 30). */
  enviarLuciernaga(x, y) {
    if (this._enLectura) return;
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

  /** Dónde está Tizno (su cabeza, aprox) para la órbita de la polilla. */
  posicionDeTizno() {
    if (!this._libre || !this._frame) return null;
    const r = this._frame.getBoundingClientRect();
    if (!r.width) return null;
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.42 };
  }

  /** El punto que ronda la luciérnaga-compañera: el candado. */
  getPosition() {
    const r = this._candado?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  isOpen() { return this._open; }
}
