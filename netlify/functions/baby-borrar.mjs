/* Baby Tizno: borrar en ElevenLabs la conversación que el adulto borra en el
   aparato. La clave vive en Netlify (ELEVENLABS_API_KEY), nunca en el
   navegador. Sin clave → 500 not_configured y el borrado local ya vale. */
export default async (req) => {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return Response.json({ ok: false, error: 'not_configured' }, { status: 500 });
    let id = '';
    try { ({ id } = await req.json()); } catch (_) {}
    if (typeof id !== 'string' || !/^conv_[a-z0-9]{10,40}$/i.test(id)) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 });
    const r = await fetch('https://api.elevenlabs.io/v1/convai/conversations/' + encodeURIComponent(id), { method: 'DELETE', headers: { 'xi-api-key': key } });
    return Response.json({ ok: r.ok, status: r.status }, { status: r.ok ? 200 : 502 });
};
