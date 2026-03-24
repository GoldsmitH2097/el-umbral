export const CHARACTERS = [
  { slug: 'reina', title: 'La Reina Sin Corona', desc: 'Silencio. El poder no necesita adornos para aplastar. Las cicatrices de la piedra cuentan historias que el papel no soporta.', src: 'reina-sin-corona.mp4', lore: `<p>Ella no gobierna desde un trono de oro, sino desde las ruinas de las certezas de quienes la rodean. Su mera presencia altera la presión del aire en la sala. Los historiadores han intentado clasificar su reinado, pero sus libros suelen convertirse en ceniza antes de la imprenta.</p><p>No se trata de crueldad, sino de la inevitabilidad del invierno. Cuando ella camina, la corte contiene el aliento, no por miedo a un castigo, sino por el terror profundo a no ser dignos de su mirada.</p><p>Las leyendas afirman que su corona fue forjada, pero ella misma la fundió para construir las cadenas de sus enemigos.</p>` },
  { slug: 'caballero', title: 'El Caballero Sin Nombre', desc: 'Acero oscuro, óxido, firmeza absoluta. No hay honor, solo inminencia. Un golpe seco y la realidad se fractura en mil pedazos.', src: 'caballero-sin-nombre.mp4', lore: `<p>Nadie sabe bajo qué bandera lucha, porque no ha dejado sobrevivientes para que cuenten el emblema de su escudo. Su armadura está picada por el óxido y la sangre seca de mil batallas olvidadas, pesada como las consecuencias de los actos irredimibles.</p><p>No posee técnica ni estilo. Su combate es un proceso industrial de desmantelamiento humano. Cada golpe de su espada no busca vencer al oponente, sino quebrar la moral, aplastar el hueso y erradicar la esperanza.</p><p>Dicen que dentro de la armadura ya no hay un hombre, sino un concepto físico: el fin inminente.</p>` },
  { slug: 'sortilega', title: 'La Sortílega Sin Sombra', desc: 'Humo, alteración, luz temblorosa. Lo que crees ver está siempre un paso detrás de la verdad. La oscuridad danza al borde de la llama.', src: 'sortilega-sin-sombra.mp4', lore: `<p>Nunca la miras directamente. Solo la percibes en la visión periférica, como una distorsión térmica sobre el asfalto caliente. Es la arquitecta de la duda, la tejedora de las medias verdades que arruinan vidas enteras.</p><p>Sus hechizos no conjuran fuego ni rayos; alteran la percepción. Te hace creer que la puerta siempre estuvo abierta, que el abismo es solo un escalón bajo. Sus víctimas no caen en batalla, mueren de locura, atrapadas en laberintos construidos dentro de sus propias mentes.</p><p>Si alguna vez notas que el fuego de una vela vacila sin que haya viento, ella está escuchando.</p>` },
  { slug: 'arlequin', title: 'El Arlequín Sin Flores', desc: 'Una risa seca en una cámara vacía. La disrupción pura. Te asomas al borde esperando una historia, y encuentras un espejo roto.', src: 'arlequin-sin-flores.mp4', lore: `<p>La comedia murió hace siglos, y él es el forense encargado de la autopsia. Su función no es hacer reír, sino descolocar violentamente la expectativa de su audiencia. Es el fallo en el sistema, la nota disonante tocada a todo volumen.</p><p>Se mueve con tirones espasmódicos, como un muñeco de cuerdas manejado por un titiritero ebrio. Sus chistes son axiomas aterradores sobre el vacío existencial.</p><p>Cuando el Arlequín entra en la sala, la cordura sale por la ventana. No te rías con él, porque su risa es contagiosa, y rara vez se detiene antes de que te falte el aire de forma permanente.</p>` },
];

export const state = {
  activeScene: 1, currentCharIndex: 0, hasFinishedGallery: false, isSwapping: false,
  whispersFound: 0, isAwakening: false, isPressed: false, isIgnited: false, ignitionProgress: 0,
};

const _listeners = {};
export const Events = {
  on(event, cb) { if (!_listeners[event]) _listeners[event] = []; _listeners[event].push(cb); },
  emit(event, data) { (_listeners[event] || []).forEach(cb => cb(data)); },
  off(event, cb) { if (!_listeners[event]) return; _listeners[event] = _listeners[event].filter(f => f !== cb); },
};

export function transitionTo(newScene) {
  const prev = state.activeScene;
  state.activeScene = newScene;
  Events.emit('sceneChange', { from: prev, to: newScene });
}
