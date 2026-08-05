/**
 * Inclinacion.js — el teléfono como sentido.
 *
 * Un ratón sabe dónde está; un teléfono sabe cómo lo sostienes. Esto es lo
 * único que el móvil puede hacer y el escritorio no, así que en vez de
 * conformarnos con una versión reducida de la web, aquí gana algo.
 *
 * Dos sentidos distintos, no uno con más o menos intensidad:
 *
 *   · LA INCLINACIÓN (deviceorientation) es hacia dónde tira la gravedad.
 *     Cambia despacio y describe una postura. De aquí sale el reflejo del
 *     oro: girar el aparato mueve el destello, que es lo que hace una
 *     superficie metálica de verdad bajo una luz fija.
 *
 *   · EL LATIGAZO (devicemotion, aceleración SIN gravedad) es lo que se
 *     dispara al sacudir y vale cero al mover despacio. De aquí sale la
 *     inercia: no es lo mismo ladear el teléfono que zarandearlo.
 *
 * Todo se publica como variables CSS en :root, así que quien quiera
 * reaccionar solo tiene que usarlas. Se escribe una vez cada dos fotogramas
 * como mucho, y solo sobre :root: ni un repintado, ni un bucle nuevo.
 */

const SUAVE = 0.12;        // cuánto persigue la postura al sensor
const ROCE  = 0.90;        // cómo se apaga el latigazo
let activo = false;

export function initInclinacion() {
  if (activo || typeof window.DeviceOrientationEvent === 'undefined') return;

  let x = 0, y = 0;          // postura suavizada, de -1 a 1
  let sacudida = 0;          // el latigazo, se apaga solo
  let ultimoPintado = 0;
  let pendiente = false;

  const publicar = (ahora) => {
    pendiente = false;
    if (ahora - ultimoPintado < 32) return;   // ~30 veces por segundo basta
    ultimoPintado = ahora;
    const r = document.documentElement.style;
    r.setProperty('--inclina-x', x.toFixed(3));
    r.setProperty('--inclina-y', y.toFixed(3));
    r.setProperty('--sacudida', sacudida.toFixed(3));
  };
  const pedirPintado = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(publicar);
  };

  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    /* gamma es el balanceo izquierda-derecha y beta el cabeceo. Se acotan a
       ±40°, que es todo el recorrido que alguien hace sosteniendo un móvil:
       más allá el efecto se saturaría y dejaría de responder. El 35 de beta
       es la inclinación natural con la que se mira un teléfono, así que ese
       es el cero, no la horizontal. */
    const gx = Math.max(-40, Math.min(40, e.gamma)) / 40;
    const gy = Math.max(-40, Math.min(40, (e.beta || 0) - 35)) / 40;
    x += (gx - x) * SUAVE;
    y += (gy - y) * SUAVE;
    pedirPintado();
  }, { passive: true });

  if (typeof window.DeviceMotionEvent !== 'undefined') {
    window.addEventListener('devicemotion', (e) => {
      const a = e.acceleration;   // SIN gravedad: cero si mueves despacio
      if (!a) return;
      const fuerza = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
      // por debajo de 3 es pulso y respiración, no intención
      if (fuerza > 3) sacudida = Math.min(1, sacudida + (fuerza - 3) / 18);
      sacudida *= ROCE;
      if (sacudida < 0.004) sacudida = 0;
      pedirPintado();
    }, { passive: true });
  }

  activo = true;
  document.documentElement.dataset.inclina = 'si';
}

/**
 * Pide permiso. iOS EXIGE que salga de un gesto real, y el cartel lo pone
 * Apple, no nosotros — solo elegimos el momento. Ruben eligió el umbral: es
 * cuando el mundo empieza a responderte, así que preguntarlo ahí no
 * interrumpe la historia, forma parte de ella.
 */
export function pedirInclinacion() {
  const D = window.DeviceOrientationEvent;
  if (!D) return;
  if (typeof D.requestPermission !== 'function') { initInclinacion(); return; }
  try {
    D.requestPermission().then((r) => { if (r === 'granted') initInclinacion(); }).catch(() => {});
  } catch (_) {}
}
