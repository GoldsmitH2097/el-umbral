/* URL FIRMADA para abrir sesión con Tizno (auditoría de seguridad, 11-sep-2026).
   La clave de ElevenLabs vive en Netlify (ELEVENLABS_API_KEY), nunca en el
   navegador. El cliente pide aquí una URL de un solo uso (caduca a los 15 min)
   y con ella abre la sesión. Solo para los dos agentes de la casa, solo desde
   nuestros orígenes, y con un freno por IP. Sin clave → 503 y el cliente cae
   al agentId público (como hasta ahora). Cuando el agente pase a PRIVADO en
   el panel, esta función será la única puerta: un script que falsifique el
   Origin contra ElevenLabs ya no abrirá sesión. */
const AGENTES = new Set(['agent_2101kyzjd6e6ehhaaq9m4mhn8dhq', 'agent_3601m23sdxb4fx0adrkse21ynvb9']);
const ORIGEN_OK = /^https:\/\/(soulware\.live|el-umbral\.netlify\.app|deploy-preview-\d+--el-umbral\.netlify\.app)$/;
const golpes = new Map();   // ip → marcas de tiempo (memoria de la instancia: freno, no contabilidad)
export default async (req, context) => {
    if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
    const origen = req.headers.get('origin') || '';
    const referer = (req.headers.get('referer') || '').replace(/^(https:\/\/[^/]+).*$/, '$1');
    if (!ORIGEN_OK.test(origen) && !ORIGEN_OK.test(referer)) return Response.json({ ok: false, error: 'origen' }, { status: 403 });
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });
    const agente = new URL(req.url).searchParams.get('agente') || '';
    if (!AGENTES.has(agente)) return Response.json({ ok: false, error: 'agente' }, { status: 400 });
    const ip = (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'desconocida';
    const ahora = Date.now();
    const lista = (golpes.get(ip) || []).filter((t) => ahora - t < 600000);
    if (lista.length >= 8) return Response.json({ ok: false, error: 'freno' }, { status: 429 });
    lista.push(ahora); golpes.set(ip, lista);
    const r = await fetch('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=' + encodeURIComponent(agente), { headers: { 'xi-api-key': key } });
    if (!r.ok) return Response.json({ ok: false, error: 'upstream' }, { status: 502 });
    const datos = await r.json();
    return Response.json({ ok: true, signedUrl: datos.signed_url }, { headers: { 'cache-control': 'no-store' } });
};
