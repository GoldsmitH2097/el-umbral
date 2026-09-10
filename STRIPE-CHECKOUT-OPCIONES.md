# STRIPE-CHECKOUT-OPCIONES.md — Cómo meter el pago en un modal negro propio sin perder nada

## Verificado en docs.stripe.com el 10-sep-2026 (agente de lectura). Complementa la decisión de pagos del 8-sep (dos raíles: Stripe normal + Bizum para ES/UE; Managed Payments para fuera de la UE).

## Las cuatro integraciones y cuánto se pueden vestir

| Integración | Personalización | Bizum | PayPal | Wallets/Link | Stripe Tax | Managed Payments |
|---|---|---|---|---|---|---|
| Checkout alojado (página de Stripe) | 15 ajustes de marca del Dashboard (logo, fondo, botón, fuente, formas) | sí | sí | sí | sí | **sí** |
| Embedded Checkout (`ui_mode=embedded`, iframe en nuestra página) | los mismos 15; «el CSS de tu página no cruza el iframe» | sí | sí | sí | sí | **sí** |
| Formulario integrado (`ui_mode=form`, public preview) | 70 ajustes vía Appearance API (temas night/flat, variables); «el diseño se mantiene uniforme» | sí | sí | sí | sí | **sí** |
| **Elements con Checkout Sessions (`ui_mode=elements`)** | **CSS completo** vía Appearance API (theme `night`, `variables`, `rules`); nosotros montamos Payment Element + Express Checkout Element + nuestro botón | sí (`payment_method_types:['bizum']`) | sí | sí (dominio registrado) | **sí** | **NO** |
| Payment Element + PaymentIntents | CSS completo | sí | sí | sí | solo con Tax Calculations API a mano | NO |

Fuentes: docs.stripe.com/payments/checkout/build-integration · /payments/checkout/customization/appearance · /elements/appearance-api?api-integration=checkout · /tax/checkout/elements · /payments/bizum/accept-a-payment?payment-ui=elements&api-integration=checkout

## Managed Payments (merchant of record)
- Solo «Checkout, Payment Links» (alojado, embedded page, form). «No admite componentes web embebibles ni integraciones avanzadas» → incompatible con `ui_mode=elements`.
- Métodos: «cards, Apple Pay, Google Pay, or Link» (+ locales de EE. UU./Asia/BE). **Sin Bizum ni PayPal.** Tarjeta, Apple Pay, Google Pay y Link «cannot be disabled».
- Solo productos digitales con tax code; 3,5 % sobre las tarifas normales; extracto «LINK.COM* descriptor»; sin dominio propio en el checkout.
- Se activa por sesión: `managed_payments[enabled]=true/false` → se pueden mezclar raíles en la misma cuenta según país del comprador.
Fuentes: /payments/managed-payments · /how-it-works · /eligibility · /set-up · support.stripe.com (PMC read-only).

## Orden y visibilidad de métodos
- Checkout alojado/embedded: **no hay control de orden** (lo decide Stripe con «más de 100 señales»). Sí se puede filtrar: `payment_method_types`, `allowed_payment_method_types`, `excluded_payment_method_types`, `payment_method_configuration`.
- Elements: **`paymentMethodOrder`** (Payment Element y Express Checkout Element) → orden nuestro.
- Wallets no se excluyen por transacción; Link se apaga con `wallet_options.link.display=never` (Checkout) o en el Dashboard por configuración de métodos.
- Por qué Apple Pay sale como botón grande y Google Pay como línea: los botones exprés solo aparecen si el dispositivo/navegador/cartera cumplen (Google Pay exige una tarjeta real en la cartera de Google y navegador compatible; Apple Pay en embedded exige Safari 17+; nada de incógnito). Checkout además los baja al carrusel si hay campos personalizados, consentimiento de términos o tax ID; y **con Stripe Tax en Checkout, Google Pay solo aparece si se recoge dirección de envío**.
- El botón verde: por eliminación es **Link** (Apple/Google solo negro o blanco; PayPal oro/azul/plata/blanco/negro). Los docs no describen colores: inferencia.

## Bizum
Cliente en España, EUR, síncrono, 0,50–5.000 €, sin recurrentes, disputas sí, reembolsos asíncronos (hasta 5 min). Requiere NIF verificado en la cuenta (capability «pending» hasta compliance). Payment Links, Checkout y Elements (no Express Checkout Element). No aparece en Managed Payments.

## Set recomendado para 2,49 €
Tarjeta · Apple Pay · Google Pay · Link · Bizum (ES) · PayPal. Opcionales: Revolut Pay, Amazon Pay, iDEAL/Bancontact (NL/BE), MB WAY (PT). Fuera: Klarna (BNPL en 2,49 € no aporta), SEPA (6 días, disputas 8 semanas), Sofort (discontinuado 31-mar-2025), Alipay/WeChat (nicho).

## Propuesta
Dos raíles por país del comprador, misma cuenta:
1. ES/UE → modal negro propio con `ui_mode=elements` (Appearance night + oro), Stripe Tax para el IVA, orden Bizum · tarjeta · Apple · Google · PayPal · Link.
2. Fuera de la UE → sesión con `managed_payments[enabled]=true` en Checkout alojado/embedded, vestido con la marca del Dashboard (negro/oro). Tarjeta + wallets + Link.
Necesita: función Netlify que cree la Checkout Session según país (IP/`Accept-Language`), dominio registrado para wallets, Bizum y PayPal activados en el Dashboard (Javier), y el webhook que ya existe para entregar la llave.
