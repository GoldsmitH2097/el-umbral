import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'src',
  publicDir: '../public',
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
