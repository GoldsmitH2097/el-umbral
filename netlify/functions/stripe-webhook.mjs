/* stripe-webhook — la puerta por la que Stripe avisa de que alguien ha pagado.
   Netlify Function (API 2.0): POST /.netlify/functions/stripe-webhook

   Reglas de la casa (Javier, 9-sep-2026):
   · La firma se verifica SIEMPRE con STRIPE_WEBHOOK_SECRET; sin firma válida
     no se lee ni un byte del evento (400).
   · Ninguna clave en el código: STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET
     viven en las variables de entorno de Netlify.
   · 200 solo cuando el evento es auténtico. Un 5xx hace que Stripe reintente
     (hasta 3 días), así que solo se devuelve si de verdad falló el proceso.
   · Nada de aquí llega al navegador: la función responde a Stripe, no al
     visitante.

   Eventos: checkout.session.completed es el principal. Los dos async_* son
   los de Bizum y otros pagos que se confirman después de cerrar el checkout:
   con ellos, `completed` llega con payment_status 'unpaid' y el pago real
   se anuncia en async_payment_succeeded. Cualquier otro evento se acepta
   (200) y se ignora, que es lo que Stripe espera.

   Idempotencia: Stripe puede entregar el mismo evento más de una vez. Hoy
   la función no tiene efectos secundarios (solo registra), así que repetir
   es inocuo. El día que entregue algo (la llave del lector), la entrega
   tendrá que ser idempotente por session.id. */
import Stripe from 'stripe';

const EVENTOS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
]);

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

// El correo del lector no se escribe en los logs: solo su forma.
const enmascarar = (email) => {
  if (!email || !email.includes('@')) return null;
  const [u, d] = email.split('@');
  return `${u.slice(0, 1)}***@${d}`;
};

const resumen = (s) => ({
  session: s.id,
  estado: s.payment_status,
  importe: s.amount_total,
  moneda: s.currency,
  obra: s.metadata?.obra ?? null,
  email: enmascarar(s.customer_details?.email),
});

/* La entrega. Hoy solo deja constancia; aquí irá la emisión de la llave del
   lector cuando exista el cobro de Anatomía. */
function cumplir(s, motivo) {
  console.log('[stripe-webhook] pago confirmado', motivo, resumen(s));
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    console.error('[stripe-webhook] faltan STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET en el entorno');
    return json(500, { error: 'not_configured' });
  }

  const firma = req.headers.get('stripe-signature');
  if (!firma) return json(400, { error: 'missing_signature' });

  const stripe = new Stripe(secretKey);
  let event;
  try {
    // El cuerpo CRUDO, tal cual llegó: la firma se calcula sobre esos bytes.
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(raw, firma, webhookSecret);
  } catch (err) {
    console.warn('[stripe-webhook] firma inválida:', err.message);
    return json(400, { error: 'invalid_signature' });
  }

  if (!EVENTOS.has(event.type)) return json(200, { received: true, ignored: event.type });

  try {
    const s = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        if (s.payment_status === 'paid') cumplir(s, 'checkout completado');
        else console.log('[stripe-webhook] checkout cerrado, pago pendiente (asíncrono)', resumen(s));
        break;
      case 'checkout.session.async_payment_succeeded':
        cumplir(s, 'pago asíncrono confirmado');
        break;
      case 'checkout.session.async_payment_failed':
        console.warn('[stripe-webhook] pago asíncrono fallido', resumen(s));
        break;
    }
    return json(200, { received: true, type: event.type, session: s.id });
  } catch (err) {
    console.error('[stripe-webhook] error procesando', event.id, err);
    return json(500, { error: 'processing_failed' });   // Stripe reintentará
  }
};
