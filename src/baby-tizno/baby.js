/* ══════ BABY TIZNO — módulo de sesión ══════
   Sustituye al módulo del SDK del rig (tizno-ai.html). Aquí viven: la
   puerta del adulto, los ajustes, los Recuerdos y el historial (todo en
   localStorage, en este aparato), la sesión con el agente de ElevenLabs
   (variables dinámicas + herramientas de cliente) y el filtro de datos
   sensibles. Nada de esto sabe de libros ni del Umbral. */
let ConversationClase = null;
async function cargarSDK() {
    if (!ConversationClase) {
        ({ Conversation: ConversationClase } = await import('https://esm.sh/@elevenlabs/client@1.25.0'));
    }
    return ConversationClase;
}

const AGENT_ID = 'agent_3601m23sdxb4fx0adrkse21ynvb9';
const KEY = 'bt_v1';
const SESSION_MAX_S = 660;   // el agente corta a los 600; este es el cinturón
const AVISO_S = 75;          // aviso al agente para que cierre con calma
const DAILY_MAX_S = 2400;    // 40 min al día por aparato (el adulto lo verá en Ajustes más adelante)

const $ = (id) => document.getElementById(id);
const btn = $('tizno-call'), statusEl = $('tizno-status'), callUi = $('tizno-call-ui');
const uid = () => Math.random().toString(36).slice(2, 10);

/* ── El estado, en este aparato ── */
const defecto = () => ({
    v: 1,
    puerta: { aceptado: false, ts: 0 },
    ajustes: { franja: '5-7', heroe: '', memoria: true, vetados: '' },
    reino: { creado: Date.now(), recuerdos: [], capitulos: [] },
    archivo: [],   // Reinos anteriores (historias nuevas): se conservan para el historial
});
let ST = cargar();
function cargar() {
    try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.v === 1) return s; } catch (_) {}
    return defecto();
}
function guardar() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (_) {} }

/* ── Filtro de datos sensibles ──
   Lo que se guarda en este aparato (Recuerdos e historial) pasa por aquí.
   No es perfecto: quita correos, teléfonos, direcciones con número y
   nombres de colegio. El prompt ya le pide a Tizno que no repita ni anote
   datos del niño real; esto es la segunda red. */
const PRIVADO = '[dato privado]';
function limpiar(t) {
    return String(t || '')
        .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, PRIVADO)
        .replace(/(\+?\d[\d .-]{7,}\d)/g, PRIVADO)
        .replace(/\b([Cc]olegio|[Cc]ole|[Ee]scuela|[Ii]nstituto|[Gg]uarder[ií]a)\s+(de\s+|del\s+|la\s+|el\s+)?[A-ZÁÉÍÓÚÑ][^\n,.;]{2,30}/g, PRIVADO)
        .replace(/\b(calle|avenida|avda\.?|plaza|paseo|camino|carrer|c\/|portal|piso)\s+[^\n,.;]{2,40}?\s+\d{1,4}\b(\s*,?\s*\d{1,2}\s*[ºª°])?/gi, PRIVADO)
        .replace(/\b(mi|el|la)\s+(apellido|direcci[oó]n|n[uú]mero de tel[eé]fono|tel[eé]fono|contrase[ñn]a)\b[^.\n]*/gi, PRIVADO);
}

/* ── Pantallas ── */
const PANTALLAS = ['bt-puerta', 'bt-inicio', 'bt-ajustes', 'bt-fin'];
function mostrar(id) {
    PANTALLAS.forEach((p) => { $(p).hidden = (p !== id); });
    const nino = id === null;
    callUi.hidden = !nino;
    $('bt-mayores').hidden = !nino;
    if (nino && window.__tiznoPop) window.__tiznoPop(true);
}

/* ── La puerta ── */
let mult = { a: 7, b: 8 };
function prepararPuerta(mensaje) {
    mult = { a: 3 + Math.floor(Math.random() * 7), b: 3 + Math.floor(Math.random() * 7) };
    $('bt-mult').textContent = `${mult.a} × ${mult.b}`;
    $('bt-resp').value = '';
    $('bt-puerta-err').textContent = mensaje || '';
    $('bt-puerta-primera').hidden = !!ST.puerta.aceptado;
    mostrar('bt-puerta');
    setTimeout(() => { try { $('bt-resp').focus(); } catch (_) {} }, 80);
}
function entrar() {
    if (!ST.puerta.aceptado && !$('bt-acepto').checked) {
        $('bt-puerta-err').textContent = 'Marca la casilla para continuar.';
        return;
    }
    const ok = parseInt($('bt-resp').value, 10) === mult.a * mult.b;
    if (!ok) { prepararPuerta('No es eso. Prueba con esta otra.'); return; }
    if (!ST.puerta.aceptado) { ST.puerta = { aceptado: true, ts: Date.now() }; guardar(); }
    pintarInicio();
    mostrar('bt-inicio');
}
$('bt-entrar').addEventListener('click', entrar);
$('bt-resp').addEventListener('keydown', (e) => { if (e.key === 'Enter') entrar(); });

/* ── Inicio (el vestíbulo del adulto) ── */
const FRANJAS = { '5-7': '5 a 7', '8-10': '8 a 10', '11-12': '11 a 12' };
function ultimoCapitulo() { const c = ST.reino.capitulos; return c.length ? c[c.length - 1] : null; }
function pintarInicio() {
    const u = ultimoCapitulo();
    const caja = $('bt-ultimo');
    if (u && (u.resumen || u.lineas.length)) {
        caja.hidden = false;
        caja.textContent = `Capítulo ${u.n}${u.cerrado ? '' : ' (interrumpido)'}:\n` + (u.resumen || 'Sin resumen: el capítulo se quedó a medias. La transcripción está en Ajustes → Historial.');
    } else caja.hidden = true;
    const a = ST.ajustes;
    $('bt-inicio-estado').textContent =
        `Edad: ${FRANJAS[a.franja]} · Héroe: ${a.heroe.trim() || 'lo elige el niño'} · Capítulos: ${ST.reino.capitulos.length} · Recuerdos: ${ST.reino.recuerdos.length}` +
        (a.memoria ? '' : ' · Memoria apagada');
}
$('bt-dar').addEventListener('click', () => {
    mostrar(null);
    btn.textContent = 'Hablar con Tizno';
    setStatus('toca el botón y habla con él');
});
$('bt-ir-ajustes').addEventListener('click', () => { pintarAjustes(); mostrar('bt-ajustes'); });
$('bt-mayores').addEventListener('click', async () => { await dormir('mayores'); prepararPuerta(); });
$('bt-fin-mayor').addEventListener('click', () => prepararPuerta());

/* ── Ajustes ── */
function pintarAjustes() {
    const a = ST.ajustes;
    $('bt-franja').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === a.franja)));
    $('bt-heroe').value = a.heroe;
    $('bt-memoria').setAttribute('aria-checked', String(!!a.memoria));
    $('bt-vetados').value = a.vetados;
    pintarRecuerdos();
    pintarHistorial();
}
$('bt-franja').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    ST.ajustes.franja = b.dataset.v; guardar(); pintarAjustes();
});
$('bt-heroe').addEventListener('input', () => { ST.ajustes.heroe = $('bt-heroe').value.slice(0, 20); guardar(); });
$('bt-vetados').addEventListener('input', () => { ST.ajustes.vetados = $('bt-vetados').value.slice(0, 300); guardar(); });
$('bt-memoria').addEventListener('click', () => { ST.ajustes.memoria = !ST.ajustes.memoria; guardar(); pintarAjustes(); });

function pintarRecuerdos() {
    const ul = $('bt-recuerdos'); ul.innerHTML = '';
    const r = ST.reino.recuerdos;
    if (!r.length) { ul.innerHTML = '<li class="bt-vacio">Todavía no hay recuerdos. Aparecen cuando el niño inventa algo.</li>'; return; }
    r.forEach((x) => {
        const li = document.createElement('li');
        const span = document.createElement('span'); span.textContent = x.texto;
        const em = document.createElement('em'); em.textContent = ` · cap. ${x.cap}`; span.appendChild(em);
        const b = document.createElement('button'); b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', 'Borrar este recuerdo');
        b.addEventListener('click', () => { ST.reino.recuerdos = ST.reino.recuerdos.filter((y) => y.id !== x.id); guardar(); pintarRecuerdos(); });
        li.append(span, b); ul.appendChild(li);
    });
}
function pintarHistorial() {
    const cont = $('bt-historial'); cont.innerHTML = '';
    const bloques = [{ titulo: null, reino: ST.reino }, ...ST.archivo.map((r, i) => ({ titulo: `Historia anterior ${i + 1}`, reino: r }))];
    let alguno = false;
    bloques.forEach((bl) => {
        if (!bl.reino.capitulos.length) return;
        alguno = true;
        if (bl.titulo) { const h = document.createElement('p'); h.className = 'bt-nota'; h.textContent = bl.titulo; cont.appendChild(h); }
        bl.reino.capitulos.slice().reverse().forEach((c) => {
            const d = document.createElement('details'); d.className = 'bt-cap';
            const s = document.createElement('summary');
            const span = document.createElement('span');
            span.textContent = `Capítulo ${c.n} · ${new Date(c.inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}${c.cerrado ? '' : ' · interrumpido'}`;
            const b = document.createElement('button'); b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', 'Borrar este capítulo');
            b.addEventListener('click', (e) => {
                e.preventDefault();
                bl.reino.capitulos = bl.reino.capitulos.filter((y) => y !== c); guardar(); pintarHistorial(); pintarInicio();
                if (c.conversationId) borrarEnElevenLabs(c.conversationId);
            });
            s.append(span, b); d.appendChild(s);
            if (c.resumen) { const p = document.createElement('div'); p.className = 'bt-resumen'; p.textContent = c.resumen; d.appendChild(p); }
            const lin = document.createElement('div'); lin.className = 'bt-lineas';
            if (!c.lineas.length) lin.textContent = 'Sin transcripción.';
            c.lineas.forEach((l) => { const p = document.createElement('div'); const bq = document.createElement('b'); bq.textContent = l.q === 'user' ? 'Niño: ' : 'Tizno: '; p.append(bq, document.createTextNode(l.t)); lin.appendChild(p); });
            d.appendChild(lin);
            cont.appendChild(d);
        });
    });
    if (!alguno) cont.innerHTML = '<p class="bt-vacio">Todavía no hay capítulos.</p>';
}
/* Borrar en el servidor de ElevenLabs lo que el adulto borra aquí. Pasa por
   una función nuestra (la clave nunca vive en el navegador). Si la función
   no está configurada todavía, falla en silencio: el borrado local ya está. */
function borrarEnElevenLabs(id) {
    try { fetch('/.netlify/functions/baby-borrar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {}); } catch (_) {}
}
$('bt-nueva').addEventListener('click', () => {
    if (!confirm('¿Empezar una historia nueva? El Reino actual pasa al historial y el cuento empieza de cero (el nombre del héroe se conserva).')) return;
    if (ST.reino.capitulos.length || ST.reino.recuerdos.length) ST.archivo.unshift(ST.reino);
    ST.reino = { creado: Date.now(), recuerdos: [], capitulos: [] };
    guardar(); pintarAjustes(); pintarInicio();
});
$('bt-borrar-todo').addEventListener('click', () => {
    if (!confirm('¿Borrar todo? Se van el cuento, los Recuerdos, el historial y los ajustes. No hay copia.')) return;
    const ids = [...ST.reino.capitulos, ...ST.archivo.flatMap((r) => r.capitulos)].map((c) => c.conversationId).filter(Boolean);
    ids.forEach(borrarEnElevenLabs);
    try { localStorage.removeItem(KEY); localStorage.removeItem('bt_daily'); } catch (_) {}
    ST = defecto(); ST.puerta = { aceptado: true, ts: Date.now() }; guardar();
    pintarAjustes(); pintarInicio();
});
$('bt-volver').addEventListener('click', () => { pintarInicio(); mostrar('bt-inicio'); });

/* ── Estado de la llamada → el rig ── */
const setStatus = (t) => { statusEl.textContent = t; };
let lastState = 'idle', lastStateAt = Date.now();
const setState = (s) => { lastState = s; lastStateAt = Date.now(); if (window.__setTiznoAI) window.__setTiznoAI(s); };
let lastVad = 0, vadHighSince = null, watchdog = null;

/* Humor por acotaciones: en Baby Tizno no hay miedo ni enfado. */
const MOOD_LEX = [
    [/ríe|risa|carcajada|canturrea|emocionad|celebra|jaja|tesoro|maravill|pfff/, 'energia'],
    [/laugh|chuckl|giggl|excited|sings?\b|cheerful|playful|delighted/, 'energia'],
    [/sorprendid|ay, mi tinta|curios|duda|pausa|\bhmm|\bmmm/, 'duda'],
    [/gasp|curious|surprised|wondering|thoughtful|pause/, 'duda'],
];
const moodOf = (txt) => { const t = txt.toLowerCase(); for (const [re, m] of MOOD_LEX) if (re.test(t)) return m; return null; };
let ttsCps = 13, lastTotalChars = 0, speakStartAt = 0;
function buildTimeline(msg) {
    const segs = []; let inherited = null;
    for (const part of msg.split(/(\[[^\]]*\])/).filter(Boolean)) {
        if (/^\[[^\]]*\]$/.test(part)) { inherited = moodOf(part) || inherited; segs.push({ mood: inherited, chars: 2 }); continue; }
        for (const sent of part.split(/(?<=[.!?…])/)) {
            if (!sent.trim()) continue;
            const m = moodOf(sent) || (/\?\s*$/.test(sent.trim()) ? 'duda' : null);
            if (m) inherited = m;
            segs.push({ mood: inherited, chars: sent.length });
        }
    }
    if (!segs.length) return null;
    const total = segs.reduce((a, x) => a + x.chars, 0); let acc = 0;
    const out = segs.map((x) => { const st = acc / total; acc += x.chars; return { mood: x.mood, start: st, end: acc / total }; });
    lastTotalChars = total;
    return { segs: out, totalChars: total, cps: ttsCps };
}

/* ── Tope diario ── */
const todayKey = () => new Date().toISOString().slice(0, 10);
const dailyUsed = () => { try { const d = JSON.parse(localStorage.getItem('bt_daily') || '{}'); return d.date === todayKey() ? (d.secs || 0) : 0; } catch (_) { return 0; } };
const dailyAdd = (secs) => { try { localStorage.setItem('bt_daily', JSON.stringify({ date: todayKey(), secs: dailyUsed() + secs })); } catch (_) {} };

/* ── Los saludos, por franja y modo (van como {{saludo}}) ── */
const AVISO_IA_5 = 'Cuento cuentos contigo usando inteligencia artificial: soy una máquina que habla, no una persona, y a veces me equivoco. Lo que hablamos se guarda para hacer el cuento, y tu mayor puede verlo y borrarlo. Si quieres parar, di «para».';
function saludoPara(franja, modo, heroe) {
    const n = heroe || '';
    if (modo === 'seguir') {
        return `${n ? n + ', has' : 'Has'} vuelto. [emocionado] Sigo siendo Tizno, la máquina que cuenta cuentos contigo, y sigo guardando tu Reino: lo que hablamos se queda para el cuento y tu mayor puede verlo y borrarlo. Di «para» cuando quieras. ¿Seguimos donde lo dejamos?`;
    }
    if (franja === '5-7') {
        return `¡Ay, mi tinta, ${n ? 'si es ' + n : 'ya estás aquí'}! [ríe bajito] Yo soy Tizno. ${AVISO_IA_5} Escucha… hay algo dando golpecitos dentro de una tetera. ¿Qué crees que es?`;
    }
    if (franja === '8-10') {
        return `${n ? n + '. Justo' : 'Justo'} a tiempo. Soy Tizno: un personaje que inventa cuentos contigo usando inteligencia artificial. Soy una máquina, no una persona, y puedo equivocarme. Lo que hablamos se guarda para el cuento y tu mayor puede verlo y borrarlo. Di «para» cuando quieras. Hoy el cuento empieza en una aldea que todavía no tiene nombre. ¿Me la enseñas tú?`;
    }
    return `Hola${n ? ', ' + n : ''}. Soy Tizno. Máquina, hollín y tinta, en ese orden: cuento cuentos contigo usando inteligencia artificial, y me equivoco más de lo que me gustaría. Lo que hablamos se guarda para el cuento y tu mayor puede verlo y borrarlo. Di «para» y paramos. Aviso: en este cuento mando yo hasta que tú digas otra cosa. Y tú vas a decir otra cosa. Lo sé.`;
}

/* ── La sesión ── */
let conversation = null, despertando = false, cerrando = false;
let capActual = null, callStartedAt = 0, avisado = false;
let microPrestado = null;
const clonesPrestados = [];
const gumOriginal = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
navigator.mediaDevices.getUserMedia = async (c) => {
    const soloAudio = c && c.audio && !c.video;
    const vivo = microPrestado && microPrestado.getAudioTracks().some((t) => t.readyState === 'live');
    if (soloAudio && vivo) { const clon = microPrestado.clone(); clonesPrestados.push(clon); return clon; }
    return gumOriginal(c);
};

function textoRecuerdos() {
    const r = ST.reino.recuerdos.slice(-40);
    return r.length ? r.map((x) => '- ' + x.texto).join('\n') : 'ninguno todavía';
}

async function despertar() {
    if (despertando || conversation) return;
    despertando = true;
    if (dailyUsed() >= DAILY_MAX_S) { setStatus('Tizno ya ha contado mucho hoy. Mañana sigue.'); despertando = false; return; }
    btn.disabled = true;
    setStatus('pidiendo el micrófono…');
    try {
        const vivo = microPrestado && microPrestado.getAudioTracks().some((t) => t.readyState === 'live');
        if (!vivo) microPrestado = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        btn.disabled = false; despertando = false;
        if (err.name === 'NotAllowedError') setStatus('el micrófono está bloqueado: pulsa el candado de la barra de direcciones, permite el micrófono y recarga');
        else if (err.name === 'NotFoundError') setStatus('no encuentro ningún micrófono en este aparato');
        else setStatus('sin micrófono no hay cuento (' + err.name + ')');
        return;
    }
    setStatus('despertando a Tizno…');
    let Conversation;
    try { Conversation = await cargarSDK(); }
    catch (_) { btn.disabled = false; despertando = false; setStatus('no hay conexión. Prueba otra vez.'); return; }

    const a = ST.ajustes;
    const heroe = a.heroe.trim();
    const hayReino = ST.reino.capitulos.length > 0 || ST.reino.recuerdos.length > 0;
    const modo = a.memoria && hayReino ? 'seguir' : 'nuevo';
    if (!a.memoria) { ST.reino = { creado: Date.now(), recuerdos: [], capitulos: [] }; }
    capActual = { n: ST.reino.capitulos.length + 1, inicio: Date.now(), fin: 0, lineas: [], resumen: null, cerrado: false, conversationId: null };
    ST.reino.capitulos.push(capActual);
    if (a.memoria) guardar();
    cerrando = false; avisado = false;

    try {
        conversation = await Conversation.startSession({
            agentId: AGENT_ID,
            connectionType: 'websocket',
            dynamicVariables: {
                heroe, franja: a.franja, modo, capitulo: String(capActual.n),
                recuerdos: textoRecuerdos(),
                vetados: a.vetados.trim() || 'ninguno',
                saludo: saludoPara(a.franja, modo, heroe),
            },
            clientTools: {
                anotar: async ({ hecho } = {}) => {
                    const t = limpiar(String(hecho || '').trim()).slice(0, 200);
                    if (!t) return 'nada que anotar';
                    ST.reino.recuerdos.push({ id: uid(), texto: t, cap: capActual.n, ts: Date.now() });
                    if (ST.ajustes.memoria) guardar();
                    return 'anotado';
                },
                rebobinar: async () => {
                    const r = ST.reino.recuerdos;
                    const i = r.map((x) => x.cap).lastIndexOf(capActual.n);
                    if (i >= 0) { r.splice(i, 1); if (ST.ajustes.memoria) guardar(); return 'borrado el último recuerdo'; }
                    return 'no había nada que borrar';
                },
                cerrar_capitulo: async ({ resumen } = {}) => {
                    capActual.resumen = limpiar(String(resumen || '').trim()).slice(0, 1200);
                    capActual.cerrado = true; cerrando = true;
                    if (ST.ajustes.memoria) guardar();
                    return 'capítulo guardado';
                },
            },
            onConnect: () => {
                btn.textContent = 'Parar'; btn.classList.add('live'); btn.disabled = false;
                setState('listening'); setStatus('Tizno te escucha… habla');
                callStartedAt = Date.now(); vadHighSince = null;
                try { capActual.conversationId = conversation.getId ? conversation.getId() : null; } catch (_) {}
                watchdog = setInterval(() => {
                    if (lastState === 'thinking' && Date.now() - lastStateAt > 10000) { setState('listening'); setStatus('Tizno se ha despistado… háblale otra vez'); }
                    if (vadHighSince && Date.now() - vadHighSince > 12000) setStatus('oigo ruido de fondo: pausa vídeos o música para que Tizno te oiga');
                    const callSecs = (Date.now() - callStartedAt) / 1000;
                    if (callSecs > SESSION_MAX_S) { setStatus('Tizno guarda el cuento con un lazo…'); dormir('tiempo'); }
                    else if (!avisado && callSecs > SESSION_MAX_S - AVISO_S) {
                        avisado = true;
                        try { conversation.sendContextualUpdate('AVISO DE LA PÁGINA: queda un minuto de sesión. Cierra el capítulo en tu próximo turno: relectura brevísima, usa cerrar_capitulo y despídete con refugio, sin pedirle al niño que negocie más tiempo.'); } catch (_) {}
                    }
                }, 1000);
            },
            onDisconnect: () => {
                btn.textContent = 'Hablar con Tizno'; btn.classList.remove('live'); btn.disabled = false;
                setState('idle');
                window.__tiznoSignals = null;
                conversation = null;
                if (watchdog) { clearInterval(watchdog); watchdog = null; }
                if (callStartedAt) { dailyAdd((Date.now() - callStartedAt) / 1000); callStartedAt = 0; }
                terminarCapitulo();
            },
            onModeChange: ({ mode }) => {
                setState(mode === 'speaking' ? 'speaking' : 'listening');
                setStatus(mode === 'speaking' ? 'Tizno habla…' : 'Tizno te escucha…');
                if (mode === 'speaking') speakStartAt = Date.now();
                else {
                    if (speakStartAt) {
                        const dur = (Date.now() - speakStartAt) / 1000;
                        if (dur > 1.5 && lastTotalChars > 30) {
                            const measured = lastTotalChars / dur;
                            ttsCps = Math.max(8, Math.min(22, ttsCps + (measured - ttsCps) * 0.4));
                            if (window.__tiznoTimeline) window.__tiznoTimeline.cps = ttsCps;
                        }
                        speakStartAt = 0;
                    }
                    if (cerrando) setTimeout(() => dormir('fin'), 1500);
                }
            },
            onMessage: ({ source, message }) => {
                if (typeof message !== 'string') return;
                if (source === 'user') {
                    vadHighSince = null;
                    capActual.lineas.push({ q: 'user', t: limpiar(message), ts: Date.now() });
                    if (lastState !== 'speaking') { setState('thinking'); setStatus('Tizno piensa…'); }
                } else if (source === 'ai') {
                    capActual.lineas.push({ q: 'ai', t: message, ts: Date.now() });
                    const tl = buildTimeline(message);
                    if (tl) { window.__tiznoTimeline = tl; const first = tl.segs.find((x) => x.mood); if (first && window.__setTiznoMood) window.__setTiznoMood(first.mood, 8000); }
                }
                if (ST.ajustes.memoria) guardar();
            },
            onVadScore: (e) => {
                lastVad = (typeof e === 'number' ? e : e?.vadScore) || 0;
                if (lastVad > 0.5) { if (!vadHighSince) vadHighSince = Date.now(); } else vadHighSince = null;
            },
            onError: (err) => { console.error('[baby-tizno]', err); setStatus('algo se ha roto: ' + (err?.message || err)); },
        });
        const band = (arr, from, to) => { if (!arr || !arr.length) return 0; to = Math.min(to, arr.length); let s = 0; for (let i = from; i < to; i++) s += arr[i]; return s / ((to - from) * 255); };
        window.__tiznoSignals = () => {
            try {
                const f = conversation.getOutputByteFrequencyData();
                return { outVol: conversation.getOutputVolume(), inVol: conversation.getInputVolume(), bass: band(f, 1, 9), mid: band(f, 9, 44), treble: band(f, 44, 131), vad: lastVad };
            } catch (_) { return null; }
        };
    } catch (err) {
        btn.disabled = false; setState('idle');
        setStatus('no se ha podido despertar: ' + (err?.message || err));
        console.error('[baby-tizno] startSession', err);
        // El capítulo no llegó a empezar: fuera del historial.
        ST.reino.capitulos = ST.reino.capitulos.filter((c) => c !== capActual); capActual = null; guardar();
    } finally { despertando = false; }
}

function terminarCapitulo() {
    if (!capActual) return;
    const c = capActual; capActual = null;
    c.fin = Date.now();
    const vacio = !c.lineas.length && !c.cerrado;
    if (vacio) ST.reino.capitulos = ST.reino.capitulos.filter((x) => x !== c);
    if (ST.ajustes.memoria) guardar();
    if (vacio) { setStatus('toca el botón y habla con él'); return; }
    $('bt-fin-t').textContent = c.cerrado ? 'Fin del capítulo' : 'Paramos aquí';
    $('bt-fin-p').textContent = c.cerrado
        ? 'El cuento se ha guardado con un lazo. Ahora dáselo a tu mayor, que quiere verlo.'
        : 'Tu aventura puede esperar. Dáselo a tu mayor.';
    mostrar('bt-fin');
}

async function dormir(motivo) {
    const c = conversation; conversation = null;
    if (microPrestado) { try { microPrestado.getTracks().forEach((t) => t.stop()); } catch (_) {} microPrestado = null; }
    while (clonesPrestados.length) { const clon = clonesPrestados.pop(); try { clon.getTracks().forEach((t) => t.stop()); } catch (_) {} }
    if (watchdog) { clearInterval(watchdog); watchdog = null; }
    if (c) { try { await c.endSession(); } catch (_) {} }
    else if (capActual && motivo) terminarCapitulo();
}

btn.addEventListener('click', () => (conversation ? dormir('boton') : despertar()));
document.addEventListener('visibilitychange', () => { if (document.hidden && conversation) dormir('oculto'); });

/* La escala del rig (ver baby.css): número sin unidad, por ancho de pantalla. */
function ajustarEscala() {
    const s = Math.min(1.45, Math.max(1, innerWidth / 900));
    document.documentElement.style.setProperty('--bt-escala', s.toFixed(3));
}
ajustarEscala();
window.addEventListener('resize', ajustarEscala);

/* Arranque: siempre por la puerta del adulto. */
prepararPuerta();
setTimeout(() => { if (window.__tiznoPop) window.__tiznoPop(true); }, 900);
