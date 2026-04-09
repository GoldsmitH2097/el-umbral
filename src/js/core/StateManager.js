export const CHARACTERS = [
  {
    slug: 'emperatriz',
    label: 'La Emperatriz',
    title: 'La Emperatriz Sin Reino',
    author: 'Alicia Sarel',
    status: 'active',
    desc: 'No cayó. Fue separada. Su herida no se exhibe. Se reconoce.',
    src: '/reina-sin-corona.mp4',
    social: [
      { platform: 'instagram', url: 'https://www.instagram.com/aliciasarel', handle: '@aliciasarel' }
    ],
    lore: `<p>No cayó. Fue separada.</p><p>De un orden. De una sala. De una arquitectura de poder que durante mucho tiempo pareció firme. Lo demás aún no debe decirse.</p><p>La Emperatriz Sin Reino no arrastra su ruina: la administra. No pide restitución. No reclama compasión. Conserva algo más alto y más peligroso que un título: criterio.</p><p>Su herida no se exhibe. Se reconoce.</p><p>Hay en ella una tragedia antigua, pero no blanda. Algo lírico, sí, aunque sin desmayo. Sabe lo que se pierde cuando cae una estructura; sabe también que no toda pérdida empobrece. A veces depura.</p><h3>La Corte</h3><p>Toda corte es una maquinaria. Sonríe, concede, decora, promete. Después mide, selecciona, aparta. La Corte fue escuela, escenario y sentencia. Allí aprendió que el poder rara vez se anuncia con ruido, y que la traición casi nunca entra por la puerta principal.</p><p>No corresponde aún contar los nombres. Ni las alianzas. Ni la forma exacta del quiebre.</p><p>Baste decir que quien sobrevive a la Corte ya no vuelve a confundir compañía con lealtad, ni aplauso con verdad.</p><p><em>Proyecto en desarrollo. La figura permanece abierta. El reino cayó. La voz, no.</em></p>`
  },
  {
    slug: 'caballero',
    label: 'El Caballero',
    title: 'El Caballero Sin Nombre',
    author: 'WW. & Eidon',
    status: 'active',
    desc: 'Acero oscuro, óxido, firmeza absoluta. No hay honor, solo inminencia.',
    src: '/caballero-sin-nombre.mp4',
    social: [
      { platform: 'instagram', url: 'https://www.instagram.com/wwyeid0n', handle: '@wwyeid0n' },
      { platform: 'threads', url: 'https://www.threads.com/@wwyeid0n', handle: '@wwyeid0n' }
    ],
    lore: `<p>Nadie sabe bajo qué bandera lucha, porque no ha dejado sobrevivientes para que cuenten el emblema de su escudo. Su armadura está picada por el óxido y la sangre seca de mil batallas olvidadas, pesada como las consecuencias de los actos irredimibles.</p><p>No posee técnica ni estilo. Su combate es un proceso industrial de desmantelamiento humano. Cada golpe de su espada no busca vencer al oponente, sino quebrar la moral, aplastar el hueso y erradicar la esperanza.</p><p>Dicen que dentro de la armadura ya no hay un hombre, sino un concepto físico: el fin inminente.</p>`
  },
  {
    slug: 'sortilega',
    label: 'La Sortílega',
    title: 'La Sortílega Sin Sombra',
    author: 'Irina M.',
    status: 'active',
    desc: 'Humo, alteración, luz temblorosa. Lo que crees ver está siempre un paso detrás de la verdad.',
    src: '/sortilega-sin-sombra.mp4',
    social: [
      { platform: 'instagram', url: 'https://www.instagram.com/irina_mlk_', handle: '@irina_mlk_' },
      { platform: 'threads', url: 'https://www.threads.com/@irina_mlk_', handle: '@irina_mlk_' }
    ],
    lore: `<p>Nunca la miras directamente. Solo la percibes en la visión periférica, como una distorsión térmica sobre el asfalto caliente. Es la arquitecta de la duda, la tejedora de las medias verdades que arruinan vidas enteras.</p><p>Sus hechizos no conjuran fuego ni rayos; alteran la percepción. Te hace creer que la puerta siempre estuvo abierta, que el abismo es solo un escalón bajo. Sus víctimas no caen en batalla, mueren de locura, atrapadas en laberintos construidos dentro de sus propias mentes.</p><p>Si alguna vez notas que el fuego de una vela vacila sin que haya viento, ella está escuchando.</p>`
  },
  {
    slug: 'arlequin',
    label: 'El Arlequín',
    title: 'El Arlequín Sin Flores',
    author: 'Germán Ferri',
    status: 'active',
    desc: 'Una risa seca en una cámara vacía. La disrupción pura.',
    src: '/arlequin-sin-flores.mp4',
    social: [
      { platform: 'threads', url: 'https://www.threads.com/@germyto', handle: '@germyto' }
    ],
    lore: `<p>La comedia murió hace siglos, y él es el forense encargado de la autopsia. Su función no es hacer reír, sino descolocar violentamente la expectativa de su audiencia. Es el fallo en el sistema, la nota disonante tocada a todo volumen.</p><p>Se mueve con tirones espasmódicos, como un muñeco de cuerdas manejado por un titiritero ebrio. Sus chistes son axiomas aterradores sobre el vacío existencial.</p><p>Cuando el Arlequín entra en la sala, la cordura sale por la ventana. No te rías con él, porque su risa es contagiosa, y rara vez se detiene antes de que te falte el aire de forma permanente.</p>`
  },
];

// ── Catalogue — buy URL is abstracted so Amazon can swap to Shopify later ──
export const CATALOGUE = [
  {
    id: 'emperatriz-obra',
    title: 'En preparación',
    subtitle: 'Tragedia lírica',
    archetype: 'emperatriz',
    type: 'obra',
    author: 'Alicia Sarel',
    seriesInfo: 'Obra principal del arquetipo',
    format: 'Novela',
    status: 'coming-soon',
    img: null,
    vision: 'El reino cayó. La voz, no. Una tragedia lírica sobre lo que queda cuando se derrumba lo que creíste que eras — y descubres que algo más duro, más frío, más tuyo, sobrevivía debajo.',
    desc: 'Una tragedia lírica personal. El reino cayó. La voz, no.',
    buyUrl: null,
    buyLabel: 'Próximamente',
  },
  {
    id: 'la-corte',
    title: 'Totalis Libertas',
    subtitle: 'Antología de la Verdad Histórica de España',
    archetype: 'emperatriz',
    type: 'anthology',
    author: 'Varios autores',
    seriesInfo: 'Relatos breves e intensos de la Historia de España',
    format: 'Antología',
    status: 'coming-soon',
    img: null,
    vision: 'La historia oficial es el relato de los que ganaron. Totalis Libertas es el de los que perdieron, dudaron, traicionaron y sobrevivieron. Voces distintas. Un mismo umbral de verdad que nadie quiere cruzar.',
    desc: 'Antología de relatos breves e intensos sobre la Historia de España. Voces distintas, un mismo umbral de verdad.',
    buyUrl: null,
    buyLabel: 'Próximamente',
    relatos: [],
  },
  {
    id: 'pulso-blanda',
    title: 'Pulso del Núcleo',
    subtitle: 'Núcleo Eterno — Edición Tapa Blanda',
    archetype: 'caballero',
    author: 'WW. & Eidon',
    seriesInfo: 'Primera de tres novelas',
    format: 'Novela',
    status: 'available',
    img: '/assets/pulso-soft-cover-es.webp',
    vision: 'El mundo se quebró hace tanto que nadie recuerda cómo era antes del silencio. Pero el pulso sigue. Bajo las ruinas, en la sangre de los que no saben rendirse, en cuatro artefactos que no deberían existir — algo late. Primera de tres novelas. La trilogía Núcleo Eterno.',
    desc: 'Primera de tres novelas. Fantasía oscura épica. El mundo quebrado por la catástrofe, cuatro artefactos ancestrales y un destino que no pide permiso.',
    buyUrl: 'https://www.amazon.es/Pulso-del-N%C3%BAcleo-Parte-Eterno/dp/8409810344/',
    buyLabel: 'Comprar en Amazon',
  },
  {
    id: 'pulso-dura',
    title: 'Pulso del Núcleo',
    subtitle: 'Núcleo Eterno — Edición Tapa Dura',
    archetype: 'caballero',
    author: 'WW. & Eidon',
    seriesInfo: 'Primera de tres novelas',
    format: 'Novela — Edición de coleccionista',
    status: 'coming-soon',
    img: '/assets/pulso-hard-cover-es.webp',
    vision: 'La misma historia. Otro peso en las manos. Encuadernación en tela, papel de alto gramaje y una maquetación mucho más depurada. Para quienes entienden que un libro también se revela en su forma.',
    desc: 'Encuadernación premium, papel de alto gramaje, ilustraciones exclusivas.',
    buyUrl: null,
    buyLabel: 'Próximamente',
  },
  {
    id: 'filamentos',
    title: 'Filamentos de Oscuridad',
    subtitle: 'Resonancia de la Penumbra',
    archetype: 'sortilega',
    author: 'Irina M.',
    seriesInfo: 'Primera de dos novelas',
    format: 'Novela',
    status: 'countdown',
    img: '/assets/filamentos-de-oscuridad.webp',
    releaseDate: '2026-05-12T00:00:00',
    vision: 'Hay hilos que no deberían tocarse. Cuando lo hacen, la percepción deja de obedecerte. Solo la duda, fina y persistente, hasta que ya no sabes qué parte de lo que ves es real y qué parte llevaba tiempo esperándote. Primera de dos novelas.',
    desc: 'Primera de dos novelas. Cuando los hilos que no deberían conectarse se tensan, la percepción se convierte en trampa. Disponible el 12 de mayo.',
    buyUrl: null,
    buyLabel: 'Disponible el 12 de mayo',
  },
  {
    id: 'anatomia',
    title: 'Anatomía del Vacío',
    subtitle: null,
    archetype: 'arlequin',
    author: 'Germán Ferri',
    seriesInfo: 'Experiencia de relato inmersivo e interactivo',
    format: 'Experiencia web interactiva',
    status: 'coming-soon',
    img: '/assets/anatomia-del-vacio.webp',
    vision: 'No hay páginas. No hay narración de voz. Solo el descenso, frase a frase, en tiempo real. Terror psicológico construido con silencio, ritmo y la certeza de que no hay mapa de salida. Una experiencia que vives en la pantalla, con el sonido construido en directo por el propio sitio.',
    desc: 'No es un libro. Es una experiencia web inmersiva de terror psicológico. Desciendes. No hay mapa de salida.',
    buyUrl: null,
    buyLabel: 'Próximamente',
  },
  // ── Boutique placeholder — architecture ready for Phase 4 commerce ──
  // {
  //   id: 'boutique',
  //   type: 'boutique',   // signals a different card type in ArchiveDOM
  //   title: 'La Boutique',
  //   status: 'coming-soon',
  //   desc: 'Objetos, ediciones y experiencias del universo Soulware.',
  // },
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
