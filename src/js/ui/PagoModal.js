/* PagoModal — el cofre de pago propio: negro y oro, con las piezas de Stripe
   dentro (Elements con Checkout Sessions). Nada de Stripe se abre en otra
   pestaña: el visitante paga sin salir del Umbral.

   Flujo: clic en .obra-compra → el modal se abre y pide al servidor una
   Checkout Session (crear-sesion-pago) → Stripe.js pinta los botones exprés
   (Apple Pay, Google Pay, PayPal…), el correo y el formulario (tarjeta,
   Bizum…) con nuestra apariencia → «Pagar» confirma. Tarjeta: se resuelve
   aquí mismo. Bizum/PayPal: Stripe redirige y vuelve a ?pago=vuelta, y el
   modal se abre en modo estado.

   Stripe.js se carga BAJO DEMANDA desde js.stripe.com (obligatorio por PCI:
   nunca empaquetado ni copiado). Quien no compra no descarga nada. */
import { CATALOGUE } from '../core/StateManager.js';
import { t, getField, lang } from '../core/i18n.js';

const STRIPE_JS = 'https://js.stripe.com/dahlia/stripe.js';
const FN_CREAR = '/.netlify/functions/crear-sesion-pago';
const FN_ESTADO = '/.netlify/functions/estado-pago';

/* La apariencia: la misma piel que el Aviso y los modales legales. */
const APARIENCIA = {
  theme: 'night',
  variables: {
    colorPrimary: '#c8922a',
    colorBackground: '#0a0906',
    colorText: '#dddddd',
    colorTextSecondary: '#8c8c8c',
    colorTextPlaceholder: '#5a5a5a',
    colorDanger: '#e0704f',
    colorIcon: '#8c8c8c',
    fontFamily: "'Times New Roman', Times, serif",
    fontSizeBase: '14px',
    borderRadius: '3px',
    spacingUnit: '4px',
    focusOutline: 'none',
    focusBoxShadow: 'none',
  },
  rules: {
    '.Input': { backgroundColor: '#0a0906', border: '1px solid rgba(200,146,42,0.35)', color: '#dddddd', boxShadow: 'none' },
    '.Input:focus': { borderColor: 'rgba(200,146,42,0.75)', boxShadow: 'none' },
    '.Input--invalid': { borderColor: '#e0704f' },
    '.Label': { color: '#8c8c8c', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' },
    '.Tab, .AccordionItem, .PickerItem': { backgroundColor: '#0a0906', border: '1px solid rgba(200,146,42,0.22)', color: '#bbbbbb', boxShadow: 'none' },
    '.Tab:hover, .AccordionItem:hover, .PickerItem:hover': { borderColor: 'rgba(200,146,42,0.5)', color: '#dddddd' },
    '.Tab--selected, .AccordionItem--selected, .PickerItem--selected': { borderColor: '#c8922a', color: '#e8c87a', boxShadow: 'none' },
    '.TabIcon--selected, .AccordionItemIcon--selected': { fill: '#e8c87a' },
    '.Block': { backgroundColor: '#0a0906', border: '1px solid rgba(200,146,42,0.22)', boxShadow: 'none' },
    '.CheckboxInput': { backgroundColor: '#0a0906', border: '1px solid rgba(200,146,42,0.4)' },
    '.Error': { color: '#e0704f' },
  },
};

let stripeJs = null;
function cargarStripeJs() {
  if (!stripeJs) {
    stripeJs = new Promise((resolve, reject) => {
      if (window.Stripe) return resolve(window.Stripe);
      const s = document.createElement('script');
      s.src = STRIPE_JS; s.async = true;
      s.onload = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error('Stripe.js')));
      s.onerror = () => reject(new Error('Stripe.js no cargó'));
      document.head.appendChild(s);
    });
  }
  return stripeJs;
}

const $ = (id) => document.getElementById(id);
let vivo = null;          // { checkout, actions, elementos[] } de la sesión abierta
let focoPrevio = null, ocultarT = null;

function textos() {
  $('pago-eyebrow').textContent = t('pago.eyebrow');
  $('pago-o').textContent = t('pago.o-con');
  $('pago-nota').textContent = t('pago.nota');
  $('pago-correo-nota').textContent = t('pago.correo-nota');
  $('pago-marcas').setAttribute('aria-label', t('pago.marcas-aria'));
  $('pago-cerrar').setAttribute('aria-label', t('aviso.close-aria'));
  $('pago-confirmar').textContent = t('pago.pagar');
}

function mostrarModal() {
  const modal = $('pago-modal');
  focoPrevio = document.activeElement;
  clearTimeout(ocultarT);
  modal.style.display = '';
  void modal.offsetHeight;          // reflow síncrono: el fundido anima aunque la pestaña esté de fondo
  modal.classList.add('open');
  modal.removeAttribute('inert');
  modal.removeAttribute('aria-hidden');
  if (!modal.dataset.ligado) {
    modal.dataset.ligado = '1';
    $('pago-cerrar').addEventListener('click', cerrarPago);
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarPago(); });
    modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarPago(); });
  }
}

export function cerrarPago() {
  const modal = $('pago-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('inert', '');
  modal.setAttribute('aria-hidden', 'true');
  ocultarT = setTimeout(() => {
    modal.style.display = 'none';
    // Se desmontan las piezas de Stripe: la siguiente compra abre sesión nueva.
    if (vivo) { vivo.elementos.forEach((el) => { try { el.unmount(); } catch (_) {} }); vivo = null; }
    for (const id of ['pago-express', 'pago-contacto', 'pago-elemento']) { const n = $(id); if (n) n.innerHTML = ''; }
  }, 450);
  try { focoPrevio?.focus(); } catch (_) {}
}

function modo(cual) {
  // cual: 'cargando' | 'formulario' | 'estado'
  $('pago-cargando').hidden = cual !== 'cargando';
  $('pago-cuerpo').hidden = cual !== 'formulario';
  $('pago-estado').hidden = cual !== 'estado';
}

function estadoPintar(titulo, cuerpo) {
  $('pago-estado-titulo').textContent = titulo;
  $('pago-estado-cuerpo').textContent = cuerpo;
  modo('estado');
}

/* Abre el cofre de pago de una obra del catálogo. */
export async function abrirPago(obraId) {
  const item = CATALOGUE.find((o) => o.id === obraId);
  if (!item || !$('pago-modal')) return;
  textos();
  $('pago-titulo').textContent = getField(item, 'title');
  $('pago-precio').textContent = getField(item.compra, 'label').replace(/^(Comprar|Buy)\s*—\s*/, '');
  $('pago-errores').textContent = '';
  $('pago-cargando').textContent = t('pago.cargando');
  modo('cargando');
  mostrarModal();

  try {
    const [Stripe, datos] = await Promise.all([
      cargarStripeJs(),
      fetch(FN_CREAR, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ obra: obraId, idioma: lang }),
      }).then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.falta ? `${t('pago.error-config')} (${j.falta})` : (j.mensaje || j.error || r.status));
        return j;
      }),
    ]);

    const stripe = Stripe(datos.publishableKey);
    const checkout = stripe.initCheckoutElementsSdk({
      clientSecret: datos.clientSecret,
      elementsOptions: { appearance: APARIENCIA },
    });
    const boton = $('pago-confirmar');
    let sessionId = null;
    checkout.on('change', (session) => {
      sessionId = session.id || sessionId;
      boton.disabled = !session.canConfirm;
      const total = session.total?.total?.amount;
      if (total) boton.textContent = `${t('pago.pagar')} ${total}`;
    });

    const cargado = await checkout.loadActions();
    if (cargado.type !== 'success') throw new Error(cargado.error?.message || 'loadActions');
    const { actions } = cargado;

    /* Botones exprés: Apple Pay, Google Pay y PayPal, en negro. Link fuera de
       los botones grandes (Ruben, 10-sep: el verde no pega); sigue dentro del
       formulario para quien lo use. */
    const express = checkout.createExpressCheckoutElement({
      buttonHeight: 44,
      buttonTheme: { applePay: 'white-outline', googlePay: 'white', paypal: 'black' },
      paymentMethods: { link: 'never' },
      paymentMethodOrder: ['applePay', 'googlePay', 'paypal'],
      layout: { maxColumns: 1, maxRows: 3, overflow: 'never' },
    });
    // Sin cartera disponible en este navegador, ni hueco ni «o paga con».
    $('pago-express').hidden = true; $('pago-o').hidden = true;
    express.on('availablepaymentmethodschange', ({ paymentMethods }) => {
      const hay = !!paymentMethods && Object.values(paymentMethods).some(Boolean);
      $('pago-express').hidden = !hay;
      $('pago-o').hidden = !hay;
    });
    express.on('confirm', (event) => actions.confirm({ expressCheckoutConfirmEvent: event, redirect: 'if_required' }).then(resultado));
    express.mount('#pago-express');

    const contacto = checkout.createContactDetailsElement();
    contacto.mount('#pago-contacto');

    /* Acordeón con la tarjeta ya abierta: para 2,49 € nadie quiere un clic
       más. Radios visibles y separación entre métodos. */
    const pago = checkout.createPaymentElement({
      layout: { type: 'accordion', defaultCollapsed: false, radios: 'always', spacedAccordionItems: true },
    });
    pago.mount('#pago-elemento');

    vivo = { checkout, actions, elementos: [express, contacto, pago] };
    modo('formulario');

    async function resultado(r) {
      if (r.type === 'error') { $('pago-errores').textContent = r.error?.message || t('pago.error'); boton.disabled = false; return; }
      // Pago en el sitio (tarjeta): sin redirección. Preguntamos cómo quedó.
      if (r.type === 'success') await pintarEstadoDeSesion(sessionId || r.session?.id);
    }
    boton.addEventListener('click', () => {
      $('pago-errores').textContent = '';
      boton.disabled = true;
      actions.confirm({ redirect: 'if_required' }).then(resultado).catch((e) => { $('pago-errores').textContent = e?.message || t('pago.error'); boton.disabled = false; });
    });
  } catch (err) {
    console.error('[pago]', err);
    estadoPintar(t('pago.error-titulo'), `${t('pago.error')} ${err?.message ? '(' + err.message + ')' : ''}`);
  }
}

async function pintarEstadoDeSesion(sessionId) {
  if (!sessionId) { estadoPintar(t('pago.ok-titulo'), t('pago.ok-cuerpo')); return; }
  try {
    const r = await fetch(`${FN_ESTADO}?session_id=${encodeURIComponent(sessionId)}`);
    const j = await r.json();
    if (j.pago === 'paid') estadoPintar(t('pago.ok-titulo'), t('pago.ok-cuerpo'));
    else if (j.estado === 'complete') estadoPintar(t('pago.pendiente-titulo'), t('pago.pendiente-cuerpo'));
    else estadoPintar(t('pago.fallo-titulo'), t('pago.fallo-cuerpo'));
  } catch (_) {
    estadoPintar(t('pago.ok-titulo'), t('pago.ok-cuerpo'));
  }
}

/* La vuelta de Bizum/PayPal (y de cualquier método con redirección):
   ?pago=vuelta&session_id=cs_… → se abre el cofre en modo estado y la URL
   queda limpia. */
export async function comprobarVueltaPago() {
  const p = new URLSearchParams(location.search);
  if (p.get('pago') !== 'vuelta' || !$('pago-modal')) return;
  const sid = p.get('session_id');
  const obra = CATALOGUE.find((o) => o.compra) || null;
  textos();
  $('pago-titulo').textContent = obra ? getField(obra, 'title') : '';
  $('pago-precio').textContent = '';
  $('pago-cargando').textContent = t('pago.comprobando');
  modo('cargando');
  mostrarModal();
  try { history.replaceState(null, '', location.pathname); } catch (_) {}
  await pintarEstadoDeSesion(sid);
}

/* El botón de compra, donde esté (cofre del grid o vista de lectura). El
   enlace de Stripe queda de red de seguridad si el JS no llegó. */
document.addEventListener('click', (e) => {
  const b = e.target.closest('.obra-compra');
  if (!b) return;
  e.preventDefault();
  abrirPago(b.dataset.obra || 'anatomia');
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', comprobarVueltaPago);
else comprobarVueltaPago();
