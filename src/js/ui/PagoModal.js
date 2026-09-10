/* PagoModal — el cofre de pago propio: negro y oro, con las piezas de Stripe
   dentro (Elements con Checkout Sessions). Nada de Stripe se abre en otra
   pestaña: el visitante paga sin salir del Umbral.

   Tres pasos que se destapan uno a uno (Ruben, 10-sep: «ahora es muy
   confuso»):
     ① Cómo pagar — cinco puertas a la vista: Apple Pay, Google Pay y PayPal
        (botones oficiales que pinta Stripe; solo se les puede elegir el
        color) y Tarjeta y Bizum (botones nuestros, en oro).
     ② Tus datos — aparece al elegir Tarjeta o Bizum: correo (ahí va la
        llave) y el formulario de ESE método y ningún otro: cada método abre
        su propia Checkout Session con un único payment_method_type, así
        Stripe pinta solo sus campos.
     ③ Confirmar — el botón «Pagar» aparece cuando el formulario está
        completo (canConfirm).
   Las carteras (Apple/Google/PayPal) no pasan por ② ni ③: su hoja recoge el
   correo y confirma sola.

   Tarjeta se resuelve aquí mismo. Bizum/PayPal: Stripe redirige y vuelve a
   ?pago=vuelta, y el modal se abre en modo estado.

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
/* La compra abierta: { stripe, obraId, express, carteras: {checkout, actions},
   metodo: 'tarjeta'|'bizum'|null, sesiones: { tarjeta: {...}, bizum: {...} } } */
let vivo = null;
let focoPrevio = null, ocultarT = null;

function textos() {
  $('pago-eyebrow').textContent = t('pago.eyebrow');
  $('pago-nota').textContent = t('pago.nota');
  $('pago-correo-nota').textContent = t('pago.correo-nota');
  $('pago-paso1-t').textContent = t('pago.paso1');
  $('pago-paso2-t').textContent = t('pago.paso2');
  $('pago-paso3-t').textContent = t('pago.paso3');
  $('pago-paso2-cargando').textContent = t('pago.abriendo');
  $('pago-metodo-tarjeta-txt').textContent = t('pago.tarjeta');
  $('pago-metodo-tarjeta').setAttribute('aria-label', t('pago.tarjeta'));
  $('pago-metodo-bizum').setAttribute('aria-label', 'Bizum');
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
    document.querySelectorAll('.pago-metodo').forEach((b) => b.addEventListener('click', () => elegirMetodo(b.dataset.metodo)));
    $('pago-confirmar').addEventListener('click', confirmar);
  }
}

function desmontarTodo() {
  if (!vivo) return;
  const todos = [vivo.express, ...Object.values(vivo.sesiones).flatMap((s) => s.elementos || [])];
  todos.forEach((el) => { try { el?.destroy(); } catch (_) {} });
  try { vivo.vigia?.disconnect(); } catch (_) {}
  vivo = null;
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
    desmontarTodo();
    for (const id of ['pago-express', 'pago-contacto', 'pago-elemento']) { const n = $(id); if (n) n.innerHTML = ''; }
    document.querySelectorAll('.pago-metodo').forEach((b) => b.classList.remove('elegido'));
  }, 450);
  try { focoPrevio?.focus(); } catch (_) {}
}

function modo(cual) {
  /* cual: 'cargando' | 'pintando' | 'formulario' | 'estado'.
     'pintando': el cuerpo ya está en el flujo (Stripe necesita anchura real
     para pintar sus botones) pero plegado e invisible bajo el texto de
     carga; 'formulario' lo despliega. */
  $('pago-cargando').hidden = cual !== 'cargando' && cual !== 'pintando';
  $('pago-cuerpo').hidden = cual !== 'formulario' && cual !== 'pintando';
  $('pago-cuerpo').classList.toggle('pintando', cual === 'pintando');
  $('pago-estado').hidden = cual !== 'estado';
  // La franja de marcas acompaña la carga y el resultado; en el formulario
  // sobra, porque las cinco puertas ya llevan sus logos.
  $('pago-marcas').hidden = cual === 'formulario';
}

function pasos(n) {
  for (let i = 1; i <= 3; i++) $(`pago-paso-${i}`).hidden = i > n;
}

function estadoPintar(titulo, cuerpo) {
  $('pago-estado-titulo').textContent = titulo;
  $('pago-estado-cuerpo').textContent = cuerpo;
  modo('estado');
}

function error(msg) { $('pago-errores').textContent = msg || t('pago.error'); }

async function crearSesion(obraId, metodo) {
  const r = await fetch(FN_CREAR, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ obra: obraId, idioma: lang, metodo: metodo || 'carteras' }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.falta ? `${t('pago.error-config')} (${j.falta})` : (j.mensaje || j.error || r.status));
  return j;
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
  $('pago-confirmar').disabled = true;
  document.querySelectorAll('.pago-metodo').forEach((b) => b.classList.remove('elegido'));
  desmontarTodo();
  modo('cargando');
  mostrarModal();

  try {
    const [Stripe, datos] = await Promise.all([cargarStripeJs(), crearSesion(obraId)]);
    const stripe = Stripe(datos.publishableKey);

    /* Sesión de carteras (tarjeta + PayPal en el servidor): de ella salen los
       botones oficiales de Apple Pay, Google Pay y PayPal. */
    const checkout = stripe.initCheckoutElementsSdk({
      clientSecret: datos.clientSecret,
      elementsOptions: { appearance: APARIENCIA },
    });
    let sessionId = null;
    checkout.on('change', (session) => { sessionId = session.id || sessionId; });
    const cargado = await checkout.loadActions();
    if (cargado.type !== 'success') throw new Error(cargado.error?.message || 'loadActions');
    const { actions } = cargado;

    const express = checkout.createExpressCheckoutElement({
      buttonHeight: 44,
      /* Negros los tres (Ruben, 10-sep). Solo Apple, Google y PayPal pintan
         sus botones: se les elige el color y la altura, nada más. */
      buttonTheme: { applePay: 'black', googlePay: 'black', paypal: 'black' },
      /* Apple Pay fuera de Safari (Chrome, Edge, Firefox de escritorio) y
         Google Pay fuera de Chrome solo salen con 'always': Stripe muestra el
         botón y Apple/Google resuelven el pago (Apple, con un código que se
         escanea con el iPhone). Link no: su bloque «guardar mi información»
         sobra en un pago de 2,49 €. */
      paymentMethods: { applePay: 'always', googlePay: 'always', link: 'never' },
      paymentMethodOrder: ['applePay', 'googlePay', 'paypal'],
      /* OJO: con `overflow: 'never'` junto a maxColumns/maxRows el elemento
         nunca dispara `ready` (bisecado el 10-sep con siete sondas). */
      layout: { maxColumns: 1, maxRows: 3 },
    });
    vivo = { stripe, obraId, express, carteras: { checkout, actions }, metodo: null, sesiones: {} };

    /* El cuerpo entra en el flujo ANTES de montar: dentro de un display:none
       Stripe mide 0 px y no pinta. Se destapa cuando los botones están (o
       tras 2,5 s si este navegador no tiene ninguna cartera). */
    pasos(1);
    modo('pintando');
    let destapado = false;
    /* `ready` llega un instante antes de que los botones se vean: 400 ms de
       cortesía para no destapar un lecho vacío. */
    const destapar = () => { if (!destapado && vivo?.express === express) { destapado = true; setTimeout(() => { if (vivo?.express === express) modo('formulario'); }, 400); } };
    /* El lecho de los botones (fondo y marco) solo cuando los botones ya
       ocupan sitio: `ready` llega segundos antes de que Stripe los pinte, y
       un lecho vacío parecía un error. Lo vigila un ResizeObserver. */
    const hueco = $('pago-express');
    hueco.classList.remove('hay');
    vivo.vigia = new ResizeObserver(() => hueco.classList.toggle('hay', hueco.getBoundingClientRect().height > 20));
    vivo.vigia.observe(hueco);
    express.on('ready', destapar);
    express.on('availablepaymentmethodschange', destapar);
    express.on('loaderror', () => destapar());
    setTimeout(destapar, 2500);
    express.on('confirm', (event) => {
      $('pago-errores').textContent = '';
      actions.confirm({ expressCheckoutConfirmEvent: event, redirect: 'if_required' })
        .then((r) => resultado(r, sessionId))
        .catch((e) => error(e?.message));
    });
    express.mount('#pago-express');
  } catch (err) {
    console.error('[pago]', err);
    estadoPintar(t('pago.error-titulo'), `${t('pago.error')} ${err?.message ? '(' + err.message + ')' : ''}`);
  }
}

/* ② Tarjeta o Bizum: su propia sesión (un solo método) → correo + campos. */
async function elegirMetodo(metodo) {
  if (!vivo || !vivo.stripe) return;
  document.querySelectorAll('.pago-metodo').forEach((b) => b.classList.toggle('elegido', b.dataset.metodo === metodo));
  if (vivo.metodo === metodo) return;
  /* Se retira el método anterior. Sus piezas se DESTRUYEN, no se desmontan:
     un iframe de Stripe vuelto a montar se queda en blanco (visto con el
     correo al pasar de Bizum a Tarjeta). La sesión y sus actions se guardan
     y las piezas se crean de nuevo si vuelve. */
  const anterior = vivo.metodo && vivo.sesiones[vivo.metodo];
  if (anterior) { anterior.elementos.forEach((el) => { try { el.destroy(); } catch (_) {} }); anterior.elementos = []; }
  vivo.metodo = metodo;
  $('pago-errores').textContent = '';
  $('pago-confirmar').disabled = true;
  pasos(2);
  $('pago-paso2-cargando').hidden = false;
  try {
    let s = vivo.sesiones[metodo];
    if (!s) {
      const datos = await crearSesion(vivo.obraId, metodo);
      if (!vivo || vivo.metodo !== metodo) return;      // cambió de idea mientras cargaba
      const checkout = vivo.stripe.initCheckoutElementsSdk({
        clientSecret: datos.clientSecret,
        elementsOptions: { appearance: APARIENCIA },
      });
      s = { checkout, actions: null, sessionId: null, puede: false, total: null, elementos: [] };
      vivo.sesiones[metodo] = s;
      checkout.on('change', (session) => {
        s.sessionId = session.id || s.sessionId;
        s.puede = !!session.canConfirm;
        s.total = session.total?.total?.amount || s.total;
        if (vivo?.metodo === metodo) pintarConfirmar(s);
      });
      const cargado = await checkout.loadActions();
      if (cargado.type !== 'success') throw new Error(cargado.error?.message || 'loadActions');
      s.actions = cargado.actions;
    }
    if (!vivo || vivo.metodo !== metodo) return;
    const contacto = s.checkout.createContactDetailsElement();
    /* Un único método en la sesión: sin pestañas ni acordeón, solo sus
       campos. (Con Bizum, Stripe pide el teléfono.) */
    const pago = s.checkout.createPaymentElement({
      layout: { type: 'accordion', defaultCollapsed: false, radios: 'never' },
      // Las carteras ya tienen su puerta en el paso 1: aquí ni Google ni Apple.
      wallets: { applePay: 'never', googlePay: 'never' },
    });
    pago.on('ready', () => { if (vivo?.metodo === metodo) $('pago-paso2-cargando').hidden = true; });
    s.elementos = [contacto, pago];
    contacto.mount('#pago-contacto');
    pago.mount('#pago-elemento');
    pintarConfirmar(s);
  } catch (err) {
    console.error('[pago]', err);
    $('pago-paso2-cargando').hidden = true;
    error(`${t('pago.error')} ${err?.message ? '(' + err.message + ')' : ''}`);
  }
}

/* ③ El botón aparece cuando el formulario está completo y ya no se esconde
   (si el visitante estropea un campo, solo se apaga). */
function pintarConfirmar(s) {
  const boton = $('pago-confirmar');
  if (s.total) boton.textContent = `${t('pago.pagar')} ${s.total}`;
  boton.disabled = !s.puede;
  if (s.puede) pasos(3);
}

function confirmar() {
  const s = vivo?.metodo && vivo.sesiones[vivo.metodo];
  if (!s?.actions) return;
  const boton = $('pago-confirmar');
  $('pago-errores').textContent = '';
  boton.disabled = true;
  s.actions.confirm({ redirect: 'if_required' })
    .then((r) => resultado(r, s.sessionId, boton))
    .catch((e) => { error(e?.message); boton.disabled = false; });
}

async function resultado(r, sessionId, boton) {
  if (r.type === 'error') { error(r.error?.message); if (boton) boton.disabled = false; return; }
  // Pago en el sitio (tarjeta, carteras): sin redirección. Preguntamos cómo quedó.
  if (r.type === 'success') await pintarEstadoDeSesion(sessionId || r.session?.id);
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
