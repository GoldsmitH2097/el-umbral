/* Diagnóstico de configuración (10-sep-2026): dice QUÉ variables existen en
   este contexto de despliegue y si la clave de Stripe es de pruebas o real.
   Nunca devuelve valores: solo presencia y prefijo. Se puede borrar cuando
   la integración esté cerrada. */
export default async () => {
    const k = process.env.STRIPE_SECRET_KEY || '';
    const modo = !k ? 'ausente' : k.startsWith('sk_test_') ? 'pruebas (sk_test_)' : k.startsWith('sk_live_') ? 'REAL (sk_live_)' : 'formato desconocido';
    return Response.json({
        contexto: process.env.CONTEXT || 'desconocido',
        STRIPE_SECRET_KEY: modo,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? (process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_') ? 'presente (whsec_)' : 'presente, formato raro') : 'ausente',
        LLAVE_SECRET: process.env.LLAVE_SECRET ? `presente (${process.env.LLAVE_SECRET.length} caracteres)` : 'ausente',
        ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? 'presente' : 'ausente',
    }, { headers: { 'cache-control': 'no-store' } });
};
