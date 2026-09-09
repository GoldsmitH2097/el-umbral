import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* EL ENLACE DE COMPRA DE ANATOMÍA (Javier, 9-sep-2026): un Payment Link de
   Stripe, que es una URL pública (no un secreto). Llega por la variable de
   entorno STRIPE_PAYMENT_LINK_ANATOMIA, distinta por contexto de despliegue
   en Netlify (Site configuration → Environment variables → valor por
   contexto): el enlace Sandbox en Deploy Previews, el Live en Production
   cuando toque. Cinturón: si Netlify no define la variable, los contextos
   que NO son producción (deploy previews, ramas, local) usan el Sandbox
   por defecto y PRODUCCIÓN queda sin enlace — sin botón. El enlace de
   pruebas no puede llegar a soulware.live por accidente. */
const CONTEXTO_NETLIFY = process.env.CONTEXT || 'local';
const ENLACE_SANDBOX_ANATOMIA = 'https://buy.stripe.com/test_cNi3cw1kO1fZckk8Pnak000';
const ENLACE_COMPRA_ANATOMIA = process.env.STRIPE_PAYMENT_LINK_ANATOMIA
  || (CONTEXTO_NETLIFY === 'production' ? '' : ENLACE_SANDBOX_ANATOMIA);

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  define: {
    // Se sustituye en el bundle en tiempo de build; en el cliente se lee como
    // import.meta.env.STRIPE_PAYMENT_LINK_ANATOMIA (ArchiveDOM).
    'import.meta.env.STRIPE_PAYMENT_LINK_ANATOMIA': JSON.stringify(ENLACE_COMPRA_ANATOMIA),
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main site — the cinematic SPA
        main: resolve(__dirname, 'src/index.html'),
        // Anatomía del Vacío — separate entry, separate bundle, separate perf
        // budget (see src/anatomia/ENGINEERING.md invariant #2). Served at
        // /obras/anatomia-del-vacio/leer via a 200 rewrite in public/_redirects.
        anatomia: resolve(__dirname, 'src/anatomia.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
