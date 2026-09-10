/* crear-sesion-pago — abre una Checkout Session de Stripe en modo Elements
   para el modal de compra propio (negro y oro) del sitio.
   POST /.netlify/functions/crear-sesion-pago  { obra: 'anatomia', idioma: 'es'|'en', metodo?: 'carteras'|'tarjeta'|'bizum' }
   → { clientSecret, publishableKey }

   Reglas de la casa (Javier, 9-sep-2026): ninguna clave en el código; la
   secreta (STRIPE_SECRET_KEY) y la publicable (STRIPE_PUBLISHABLE_KEY) viven
   en Netlify por contexto (pruebas en las vistas previas, reales en
   producción). El precio y el producto se fijan AQUÍ, en el servidor: el
   navegador solo dice qué obra quiere. La URL de vuelta se construye a partir
   del origen de la petición, pero solo si es uno de los nuestros. */
import Stripe from 'stripe';

const PRODUCTOS = {
  anatomia: {
    nombre: 'Anatomía del Vacío — experiencia inmersiva',
    nombre_en: 'Anatomy of the Void — immersive experience',
    descripcion: 'Acceso a la experiencia web interactiva de Anatomía del Vacío, de Germán Ferri (El Arlequín Sin Flores).',
    descripcion_en: 'Access to the interactive web experience Anatomy of the Void, by Germán Ferri (The Flowerless Harlequin).',
    importe: 249,      // céntimos, IVA incluido
    moneda: 'eur',
    ruta: '/obras/anatomia-del-vacio/',
  },
};
const ORIGENES = /^https:\/\/(www\.)?(soulware\.live|el-umbral\.netlify\.app|[a-z0-9-]+--el-umbral\.netlify\.app)$/;

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!secretKey) return json(500, { error: 'not_configured', falta: 'STRIPE_SECRET_KEY' });
  if (!publishableKey) return json(500, { error: 'not_configured', falta: 'STRIPE_PUBLISHABLE_KEY' });

  let body = {};
  try { body = await req.json(); } catch (_) {}
  const producto = PRODUCTOS[body.obra];
  if (!producto) return json(400, { error: 'obra_desconocida' });
  const idioma = body.idioma === 'en' ? 'en' : 'es';
  /* Una sesión por puerta (modal en tres pasos, 10-sep): 'carteras' alimenta
     los botones de Apple Pay, Google Pay (van sobre tarjeta) y PayPal;
     'tarjeta' y 'bizum' abren sesiones de un solo método para que Stripe
     pinte únicamente sus campos. */
  const METODOS = { carteras: ['card', 'paypal'], tarjeta: ['card'], bizum: ['bizum'] };
  const tipos = METODOS[body.metodo] || METODOS.carteras;

  // Origen de vuelta: el nuestro o soulware.live. Nunca uno que venga de fuera.
  const origen = req.headers.get('origin') || '';
  const base = ORIGENES.test(origen) ? origen : 'https://soulware.live';
  const ruta = (idioma === 'en' ? '/en' : '') + producto.ruta;

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'elements',
      mode: 'payment',
      locale: idioma,
      /* Métodos fijados aquí y no por la configuración dinámica del panel:
         tarjeta (trae Apple Pay y Google Pay), Bizum y PayPal. Sin Link:
         su bloque «guardar mi información» con teléfono y nombre sobra en
         un pago de 2,49 € (Ruben, 10-sep). */
      payment_method_types: tipos,
      // Y Link tampoco se ofrece dentro del formulario de tarjeta.
      wallet_options: { link: { display: 'never' } },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: producto.moneda,
          unit_amount: producto.importe,
          tax_behavior: 'inclusive',   // 2,49 € es el precio final, con IVA dentro
          product_data: {
            name: idioma === 'en' ? producto.nombre_en : producto.nombre,
            description: idioma === 'en' ? producto.descripcion_en : producto.descripcion,
          },
        },
      }],
      /* Stripe Tax calcula el IVA del país del comprador cuando STRIPE_TAX=1
         en Netlify (la cuenta ya tiene sede en España y la categoría de
         servicios electrónicos). Apagado en la primera prueba. */
      automatic_tax: { enabled: process.env.STRIPE_TAX === '1' },
      return_url: `${base}${ruta}?pago=vuelta&session_id={CHECKOUT_SESSION_ID}`,
      metadata: { obra: body.obra, idioma },
      integration_identifier: 'soulware_modal_0001',
    });
    return json(200, { clientSecret: session.client_secret, publishableKey });
  } catch (err) {
    console.error('[crear-sesion-pago]', err?.message || err);
    return json(502, { error: 'stripe_error', mensaje: err?.message || 'desconocido' });
  }
};
