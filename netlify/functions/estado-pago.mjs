/* estado-pago — el navegador pregunta cómo acabó una Checkout Session (al
   volver de Bizum/PayPal, o tras pagar con tarjeta en el modal).
   GET /.netlify/functions/estado-pago?session_id=cs_…
   → { estado, pago, obra, importe, moneda, email (enmascarado) }
   No entrega nada: la llave del lector saldrá por el webhook (firmado). */
import Stripe from 'stripe';

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const enmascarar = (email) => {
  if (!email || !email.includes('@')) return null;
  const [u, d] = email.split('@');
  return `${u.slice(0, 1)}***@${d}`;
};

export default async (req) => {
  if (req.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json(500, { error: 'not_configured' });
  const id = new URL(req.url).searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,}$/.test(id)) return json(400, { error: 'bad_id' });
  try {
    const stripe = new Stripe(secretKey);
    const s = await stripe.checkout.sessions.retrieve(id);
    return json(200, {
      estado: s.status,                 // open | complete | expired
      pago: s.payment_status,           // paid | unpaid | no_payment_required
      obra: s.metadata?.obra || null,
      importe: s.amount_total,
      moneda: s.currency,
      email: enmascarar(s.customer_details?.email),
    });
  } catch (err) {
    console.error('[estado-pago]', err?.message || err);
    return json(502, { error: 'stripe_error' });
  }
};
