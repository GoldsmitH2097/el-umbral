/* Baby Tizno: borrar en ElevenLabs la conversación que el adulto borra en el
   aparato. La clave vive en Netlify (ELEVENLABS_API_KEY), nunca en el
   navegador. Sin clave → 503 not_configured y el borrado local ya vale.
   Auditoría 11-sep: solo desde nuestros orígenes, con freno por IP, y sin
   eco del estado remoto (un id de conversación no es enumerable, pero esto
   era un proxy de DELETE con nuestra clave para cualquiera). */
const ORIGEN_OK = /^https:\/\/(soulware\.live|el-umbral\.netlify\.app|deploy-preview-\d+--el-umbral\.netlify\.app)$/;
const golpes = new Map();
export default async (req, context) => {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const origen = req.headers.get('origin') || '';
    const referer = (req.headers.get('referer') || '').replace(/^(https:\/\/[^/]+).*$/, '$1');
    if (!ORIGEN_OK.test(origen) && !ORIGEN_OK.test(referer)) return Response.json({ ok: false, error: 'origen' }, { status: 403 });
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });
    const ip = (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'desconocida';
    const ahora = Date.now();
    const lista = (golpes.get(ip) || []).filter((t) => ahora - t < 600000);
    if (lista.length >= 6) return Response.json({ ok: false, error: 'freno' }, { status: 429 });
    lista.push(ahora); golpes.set(ip, lista);
    let id = '';
    try { ({ id } = await req.json()); } catch (_) {}
    if (typeof id !== 'string' || !/^conv_[a-z0-9]{10,40}$/i.test(id)) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 });
    try {
        await fetch('https://api.elevenlabs.io/v1/convai/conversations/' + encodeURIComponent(id), { method: 'DELETE', headers: { 'xi-api-key': key } });
    } catch (_) {}
    return Response.json({ ok: true });   // sin eco del estado remoto
};
