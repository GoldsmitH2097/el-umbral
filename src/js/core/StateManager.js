export const CHARACTERS = [
  {
    slug: 'emperatriz',
    label: 'La Emperatriz',
    title: 'La Emperatriz Sin Reino',
    author: 'Alicia Sarel',
    status: 'active',
    desc: 'No reclama compasión. Exige testigos.',
    src: '/reina-sin-corona.mp4',
    social: [
      { platform: 'instagram', url: 'https://www.instagram.com/aliciasarel', handle: '@aliciasarel' }
    ],
    lore: `<p>La Emperatriz Sin Reino no reclama compasión. Exige testigos.</p><p>No cayó. Fue separada de un orden, una sala, una arquitectura de poder que durante mucho tiempo pareció firme. La diferencia importa.</p><p>No arrastra su ruina: la administra. Conserva algo más alto y más peligroso que un título: criterio. Su herida no se exhibe. Se reconoce.</p><p>Un reino se pierde, pero una estirpe de autores nace de su ausencia. No busques aquí víctimas, sino soberanos de su propio relato. Adéntrate en la sala del exilio y reconoce la voz de los que han aprendido a administrar su propia historia.</p><h3>La Corte</h3><p>Toda corte es una maquinaria. Sonríe, concede, decora, promete. Después mide, selecciona, aparta. Allí aprendió que el poder rara vez se anuncia con ruido, y que la traición casi nunca entra por la puerta principal.</p><p>Quien sobrevive a la Corte ya no vuelve a confundir compañía con lealtad, ni aplauso con verdad.</p><p><em>El reino cayó. La voz, no.</em></p>`
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
    lore: `<p>Nadie sabe bajo qué bandera lucha, porque no ha dejado sobrevivientes para que cuenten el emblema de su escudo.</p><p>En el silencio previo a la carga, solo se escucha el acompasado golpeteo de los corazones — un pálpito unísono que recorre la formación. No luchan por oro, sino por estirpe y el juramento inmarcesible que los une. Saben que antes del ocaso, la tierra reclamará su libación carmesí.</p><p>Su armadura está picada por el óxido y la sangre seca de mil batallas olvidadas. No posee técnica ni estilo. Su combate es un proceso industrial de desmantelamiento humano. Cada golpe no busca vencer al oponente: busca quebrar la moral, aplastar el hueso, erradicar la esperanza.</p><p>Dicen que dentro de la armadura ya no hay un hombre, sino un concepto físico: el fin inminente.</p>`
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
    lore: `<p>No intentes mirarla directamente. El reflejo será tu perdición.</p><p>Solo la percibes en la visión periférica, como una distorsión térmica sobre el asfalto caliente. Es la arquitecta de la duda, la tejedora de las medias verdades que arruinan vidas enteras.</p><p>Sus hechizos no conjuran fuego ni rayos. Alteran la percepción. Te hace creer que la puerta siempre estuvo abierta, que el abismo es solo un escalón bajo. Sus víctimas no caen en batalla — mueren de locura, atrapadas en laberintos construidos dentro de sus propias mentes.</p><p>Cuidado con lo que crees saber. Ella ya está tejiendo tu destino con medias verdades.</p><p><em>Si alguna vez notas que el fuego de una vela vacila sin que haya viento, ella está escuchando.</em></p>`
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
    lore: `<p>La comedia murió hace siglos. Él es el forense encargado de la autopsia.</p><p>No entras a leer un relato. Entras para ser diseccionado por él.</p><p>El Arlequín ya te observa. Su función no es hacer reír, sino descolocar violentamente la expectativa de su audiencia. Deja que el relato hurge en tus miedos mientras escuchas el estruendo de tu propio silencio.</p><p>Se mueve con tirones espasmódicos, como un muñeco de cuerdas manejado por un titiritero ebrio. Sus chistes son axiomas aterradores sobre el vacío existencial.</p><p>Cuando el Arlequín entra en la sala, la cordura sale por la ventana. No te rías con él, porque su risa es contagiosa — y rara vez se detiene antes de que te falte el aire de forma permanente.</p><p><em>¿Vas a ser el testigo o la víctima?</em></p>`
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
    img: '/assets/alicia-cover.webp',
    vision: 'El reino cayó. La voz, no. Una tragedia lírica sobre lo que queda cuando se derrumba lo que creíste que eras — y descubres que algo más duro, más frío, más tuyo, sobrevivía debajo.',
    desc: 'El reino cayó. La voz, no. Una tragedia lírica personal.',
    buyUrl: null,
    buyLabel: 'Entrar en la Corte',
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
    img: '/assets/totalis-libertas.webp',
    vision: 'La historia oficial es el relato de los que ganaron. Totalis Libertas es el de los que perdieron, dudaron, traicionaron y sobrevivieron. Voces distintas. Un mismo umbral de verdad que nadie quiere cruzar. Salón de los reconocidos — la Emperatriz exige testigos.',
    desc: 'Antología de relatos breves e intensos sobre la Historia de España. Cruza el umbral. Conoce a los nuevos arquitectos de la palabra.',
    buyUrl: null,
    buyLabel: 'Cruza el Umbral',
  },
  {
    id: 'pulso',
    title: 'Pulso del Núcleo',
    subtitle: 'Núcleo Eterno',
    archetype: 'caballero',
    author: 'WW. & Eidon',
    seriesInfo: 'Primera de tres novelas',
    format: 'Novela',
    status: 'available',
    img: '/assets/pulso-soft-cover-es.webp',
    vision: 'El mundo se quebró hace tanto que nadie recuerda cómo era antes del silencio. Pero el pulso sigue. Bajo las ruinas, en la sangre de los que no saben rendirse, en cuatro artefactos que no deberían existir — algo late. Primera de tres novelas. La trilogía Núcleo Eterno.',
    desc: 'Primera de tres novelas. Fantasía oscura épica. El mundo quebrado por la catástrofe, cuatro artefactos ancestrales y un destino que no pide permiso.',
    editions: [
      {
        id: 'pulso-blanda',
        label: 'Tapa Blanda',
        status: 'available',
        buyUrl: 'https://www.amazon.es/Pulso-del-N%C3%BAcleo-Parte-Eterno/dp/8409810344/',
        buyLabel: 'Reclamar mi Ejemplar',
      },
      {
        id: 'pulso-dura',
        label: 'Tapa Dura',
        status: 'coming-soon',
        img: '/assets/pulso-hard-cover-es.webp',
        format: 'Edición de coleccionista',
        vision: 'La misma historia. Otro peso en las manos. Encuadernación en tela, papel de alto gramaje, maquetación depurada.',
        buyLabel: 'Próximamente',
      },
    ],
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
    buyLabel: 'Entrar en la Sombra',
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
    vision: 'No entras a leer un relato. Entras para ser diseccionado por él. Terror psicológico frase a frase, en tiempo real — sin páginas, sin narración de voz, sin mapa de salida. Solo el descenso. Solo tu silencio.',
    desc: 'No entras a leer un relato. Entras para ser diseccionado por él.',
    buyUrl: null,
    buyLabel: 'Iniciar mi Disección',
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
