// translations.js — string dictionary keyed by language.
//
// Keys are stable identifiers used by t() throughout the app. Whenever a
// user-visible string appears, it lives here — not hardcoded inline.
//
// Character lore, book vision/desc, and other long-form copy is NOT here.
// That lives next to the source data in StateManager.js with `_en` overlay
// fields (read via getField in i18n.js).
//
// Translations confirmed with Javier (2026-05-15). Marked "PLACEHOLDER" where
// English copy is still pending his pass — those will render literal Spanish
// in the dark-launched EN routes until updated.

export const STRINGS = {
  es: {
    // ── Meta / brand ────────────────────────────────────────────────────────
    'site-title':             'Soulware — Editorial Española de Ficción Oscura',
    'site-description':       'Soulware es una editorial independiente española de ficción oscura. Cuatro arquetipos, cuatro universos literarios. Descubre el catálogo, los autores y sus mundos.',
    'publisher-name':         'Soulware Editorial',

    // ── Scene 1 (Tomb) ──────────────────────────────────────────────────────
    'scene1.instruction':     'Haz clic y mantén pulsado para encender la llama',
    'scene1.instruction.mobile': 'Toca y mantén',
    'scene1.umbral-button':   'EL UMBRAL',
    'scene1.umbral-aria':     'Adentrarse en El Umbral',
    'scene1.loading':         'Despertando',
    'scene1.replay-back':     '← Volver al Umbral',
    'scene1.replay-aria':     'Volver al inicio del umbral',

    // ── Scene 2 (Voces del Umbral) ──────────────────────────────────────────
    'scene2.title':           'VOCES DEL UMBRAL',
    'scene2.hint':            'Toca las voces',
    'scene2.whisper.0':       'La piedra recuerda',
    'scene2.whisper.1':       'Lo que la carne olvida',
    'scene2.whisper.2':       'El frío no perdona',
    'scene2.whisper.3':       'La sombra ya sabe tu nombre',

    // ── Scene 3 (Awakening) ─────────────────────────────────────────────────
    'scene3.adentrarse':      'ADENTRARSE',
    'scene3.adentrarse-with-works': 'Romper el trance · Ver las obras',
    'scene3.adentrarse-aria': 'Romper el trance — saltar experiencia y ver las obras',

    // ── Pacto (Tizno) ───────────────────────────────────────────────────────
    'pacto.title':            'EL PACTO',
    'pacto.body':             'Al cruzar este umbral, aceptas que las historias aquí contenidas no fueron hechas para consolarte. Eres testigo en la oscuridad. No hay vuelta atrás. Ni garantías. Y la verdad es una carga que llevarás a solas.',
    'pacto.accept':           'ACEPTO',
    'pacto.tease-aria':       'Algo acecha desde el umbral',
    'pacto.contact-aria':     'Contacto Soulware',
    'pacto.email-placeholder':'tu@email.com',
    'pacto.email-aria':       'Tu correo electrónico para firmar El Pacto',
    'pacto.submit-aria':      'Firmar el Pacto',
    'pacto.signed-aria':      'Pacto firmado',
    'tizno.contact':          'Contacto',
    'footer.liberar':         'Liberar a Tizno',
    'footer.liberar-aria':    'Liberar a Tizno — todavía sellado',
    'footer.liberar-soon':    'Todavía no… la cerradura resiste.',
    'footer.encerrar':        'Encerrar a Tizno',
    'footer.encerrar-aria':   'Encerrar a Tizno de nuevo',
    'footer.hablar':          'Hablar con Tizno',
    'footer.colgar':          'Silenciarle',
    'tizno.info-aria':        'Sobre Tizno y tu privacidad',
    'tizno.disclaimer':       'En esta web no usamos cookies: no queremos entrometernos en tu vida ni sacar de ti nada que se pueda vender. Tizno recuerda cosas sobre ti, pero las guarda dentro de tu propio dispositivo — nosotros no nos quedamos con nada.',
    'tizno.olvidar':          'Borrar lo que sabe de ti',
    'tizno.olvidado':         'Listo: Tizno ya no recuerda nada de ti. Vuelves a ser un desconocido.',
    'tizno.sabe-nada':        'De momento no sabe nada de ti. Ni una sombra.',
    'tizno.sabe-intro':       'Lo que guarda tu dispositivo:',
    'tizno.sabe-visitas':     'visitas:',
    'tizno.sabe-nombre':      'te llama:',
    'tizno.sabe-ultima':      'última vez:',
    'tizno.mailto':           'Envíanos un mensaje',
    'tizno.identity-sub':     'Hecho de hollín y tinta.',
    'tizno.identity-soon':    'Llegará pronto',
    'tizno.pacto-label':      'Lanzamientos, relatos breves y muestras antes que nadie.',
    'tizno.consent-html':     'Acepto recibir comunicaciones de Soulware. <a href="/privacidad.html" target="_blank" rel="noopener">Privacidad</a>.',
    'tizno.honeypot-aria':    'No completar — campo trampa para bots',
    'nav.las-obras':          'LAS OBRAS',
    'nav.contacto':           'CONTACTO',
    'site-hero.title':        'Las Crónicas',
    'site-hero.sub-html':     'Cuatro arquetipos. Cuatro universos.<br>Bienvenido al Archivo de Soulware.',
    'site-hero.editorial':    'Soulware es una editorial independiente de ficción oscura y universos de autor.',
    'editorial.watermark-html': 'Editorial independiente española<br>de ficción oscura y universos de autor',
    'site-footer.tagline':    'Nada es lo que parece.',
    'reading-view.back':      '← VOLVER',
    'reading-view.back-aria': 'Volver al catálogo',
    'mobile-detail.back':     '← Volver',

    // ── Catalogue (CTAs + badges) ───────────────────────────────────────────
    'cta.buy':                'Reclamar mi Ejemplar',
    'cta.coming-soon':        'Próximamente',
    'cta.notify':             'Recibir señal',
    'cta.buyAt':              'Comprar en',
    'archive.swipe-hint':     'Desliza para descubrir \u2192',
    'ficha.isbn':             'ISBN',
    'ficha.pages':            'Páginas',
    'ficha.pagesUnit':        'páginas',
    'ficha.binding':          'Encuadernación',
    'ficha.language':         'Idioma',
    'ficha.published':        'Publicación',
    'ficha.publisher':        'Editorial',
    'pill.available':         'Disponible',
    'pill.coming-soon':       'Próximamente',
    'pill.countdown':         'Preventa',
    'format.book':            'Edición Física',
    'format.anthology':       'Antología',
    'format.experience':      'Experiencia Digital',

    // ── Edition labels (Pulso del Núcleo) ───────────────────────────────────
    'edition.softcover':      'Tapa Blanda',
    'edition.hardcover':      'Tapa Dura',

    // ── Footer / generic UI ─────────────────────────────────────────────────
    'ui.close':               'Cerrar',
    'ui.back':                '← Volver',
    'ui.in-preparation':      'En preparación',
    'ui.author':              'Autor',
    'ui.archetype':           'Arquetipo',
    'ui.no-cover':            'Sin portada',
    'ui.tales-in-preparation': 'Relatos en preparación.',
    'countdown.now':          'Disponible ahora',
    'ui.books':               'LIBROS',
    'nav.author':             'AUTOR',
    'nav.books':              'LIBROS',
    'nav.vision':             'La Visión',
    'nav.sheet':              'La Ficha',
    'footer.legal.legal':     'Aviso Legal',
    'footer.legal.privacy':   'Privacidad',
    'footer.legal.cookies':   'Cookies',
    'footer.legal.tizno':     'Tizno',

    // ── Reading view ────────────────────────────────────────────────────────
    'reading.sections-aria':  'Secciones',

    // ── Language selector ───────────────────────────────────────────────────
    'lang.selector-aria':     'Cambiar idioma',
    'lang.es':                'ES',
    'lang.en':                'EN',
  },

  en: {
    // ── Meta / brand ────────────────────────────────────────────────────────
    'site-title':             'Soulware — Spanish Dark Fiction Publisher',
    'site-description':       'Soulware is an independent Spanish dark-fiction publisher. Four archetypes, four literary universes. Explore the catalogue, the authors, and their worlds.',
    'publisher-name':         'Soulware Publishing',

    // ── Scene 1 (Tomb) ──────────────────────────────────────────────────────
    'scene1.instruction':     'Click and hold to ignite the flame',
    'scene1.instruction.mobile': 'Tap and hold',
    'scene1.umbral-button':   'THE HOLLOW',
    'scene1.umbral-aria':     'Enter the Hollow',
    'scene1.loading':         'Awakening',
    'scene1.replay-back':     '← Back to the Hollow',
    'scene1.replay-aria':     'Return to the threshold',

    // ── Scene 2 (Voices from the Hollow) ────────────────────────────────────
    'scene2.title':           'VOICES FROM THE HOLLOW',
    'scene2.hint':            'Touch the voices',
    'scene2.whisper.0':       'Stone remembers',
    'scene2.whisper.1':       'What flesh forgets',
    'scene2.whisper.2':       'Cold does not forgive',
    'scene2.whisper.3':       'The shadow already knows your name',

    // ── Scene 3 (Awakening) ─────────────────────────────────────────────────
    'scene3.adentrarse':      'STEP THROUGH',
    'scene3.adentrarse-with-works': 'Break the trance · Witness the works',
    'scene3.adentrarse-aria': 'Break the trance — skip the experience and witness the works',

    // ── Pacto / The Pact ────────────────────────────────────────────────────
    'pacto.title':            'THE PACT',
    'pacto.body':             'By crossing into the Hollow, you accept that the stories held herein were not made to comfort you. You are a witness in the dark. There is no return. No assurance. And truth is a burden you shall bear alone.',
    'pacto.accept':           'I ACCEPT',
    'pacto.tease-aria':       'Something stirs beyond the threshold',
    'pacto.contact-aria':     'Soulware contact',
    'pacto.email-placeholder':'you@email.com',
    'pacto.email-aria':       'Your email to sign The Pact',
    'pacto.submit-aria':      'Sign The Pact',
    'pacto.signed-aria':      'Pact signed',
    'tizno.contact':          'Contact',
    'footer.liberar':         'Free Tizno',
    'footer.liberar-aria':    'Free Tizno — still sealed',
    'footer.liberar-soon':    'Not yet… the lock holds.',
    'footer.encerrar':        'Cage Tizno',
    'footer.encerrar-aria':   'Cage Tizno again',
    'footer.hablar':          'Speak to Tizno',
    'footer.colgar':          'Silence him',
    'tizno.info-aria':        'About Tizno and your privacy',
    'tizno.disclaimer':       'This site uses no cookies: we have no wish to pry into your life or extract anything sellable from you. Tizno remembers things about you, but keeps them inside your own device — we keep nothing.',
    'tizno.olvidar':          'Erase what he knows about you',
    'tizno.olvidado':         'Done: Tizno remembers nothing about you. You are a stranger again.',
    'tizno.sabe-nada':        'So far he knows nothing about you. Not even a shadow.',
    'tizno.sabe-intro':       'What your device holds:',
    'tizno.sabe-visitas':     'visits:',
    'tizno.sabe-nombre':      'he calls you:',
    'tizno.sabe-ultima':      'last seen:',
    'tizno.mailto':           'Send us a message',
    'tizno.identity-sub':     'Made of soot and ink.',
    'tizno.identity-soon':    'Coming soon',
    'tizno.pacto-label':      'New releases, short tales and previews before anyone else.',
    'tizno.consent-html':     'I agree to receive communications from Soulware. <a href="/privacidad.html" target="_blank" rel="noopener">Privacy</a>.',
    'tizno.honeypot-aria':    'Do not fill — bot honeypot',
    'nav.las-obras':          'THE WORKS',
    'nav.contacto':           'CONTACT',
    'site-hero.title':        'The Chronicles',
    'site-hero.sub-html':     'Four archetypes. Four universes.<br>Welcome to the Soulware Archive.',
    'site-hero.editorial':    'Soulware — an independent publisher of dark fiction and author-driven universes.',
    'editorial.watermark-html': 'Independent publisher<br>of dark fiction and author-driven universes',
    'site-footer.tagline':    'Nothing is as it seems.',
    'reading-view.back':      '← BACK',
    'reading-view.back-aria': 'Back to the catalogue',
    'mobile-detail.back':     '← Back',

    // ── Catalogue (CTAs + badges) ───────────────────────────────────────────
    'cta.buy':                'Claim Your Copy',
    'cta.coming-soon':        'Coming Soon',
    'cta.notify':             'Send Me Word',
    'cta.buyAt':              'Buy at',
    'archive.swipe-hint':     'Swipe to discover \u2192',
    'ficha.isbn':             'ISBN',
    'ficha.pages':            'Pages',
    'ficha.pagesUnit':        'pages',
    'ficha.binding':          'Binding',
    'ficha.language':         'Language',
    'ficha.published':        'Published',
    'ficha.publisher':        'Publisher',
    'pill.available':         'Available',
    'pill.coming-soon':       'Coming Soon',
    'pill.countdown':         'Pre-order',
    'format.book':            'Print Edition',
    'format.anthology':       'Anthology',
    'format.experience':      'Digital Experience',

    // ── Edition labels (Pulso del Núcleo) ───────────────────────────────────
    'edition.softcover':      'Softcover',
    'edition.hardcover':      'Hardcover',

    // ── Footer / generic UI ─────────────────────────────────────────────────
    'ui.close':               'Close',
    'ui.back':                '← Back',
    'ui.in-preparation':      'In preparation',
    'ui.author':              'Author',
    'ui.archetype':           'Archetype',
    'ui.no-cover':            'No cover',
    'ui.tales-in-preparation': 'Tales in preparation.',
    'countdown.now':          'Available now',
    'ui.books':               'BOOKS',
    'nav.author':             'AUTHOR',
    'nav.books':              'BOOKS',
    'nav.vision':             'The Vision',
    'nav.sheet':              'The Record',
    'footer.legal.legal':     'Legal Notice',
    'footer.legal.privacy':   'Privacy',
    'footer.legal.cookies':   'Cookies',
    'footer.legal.tizno':     'Tizno',

    // ── Reading view ────────────────────────────────────────────────────────
    'reading.sections-aria':  'Sections',

    // ── Language selector ───────────────────────────────────────────────────
    'lang.selector-aria':     'Change language',
    'lang.es':                'ES',
    'lang.en':                'EN',
  },
};
