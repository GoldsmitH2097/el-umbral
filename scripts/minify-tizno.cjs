/**
 * minify-tizno.js — postbuild: compacta dist/tizno-ai.html.
 *
 * El archivo fuente vive en public/ con todos sus comentarios (nuestra
 * documentación de trabajo). Servirlo tal cual era regalar un tutorial de
 * cómo está hecho Tizno: 2.300 líneas comentadas en español. Esto NO hace
 * imposible copiar (nada del lado cliente lo es) — sube el peaje: sin
 * comentarios, sin nombres, sin estructura legible.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const f = path.join(__dirname, '..', 'dist', 'tizno-ai.html');
if (!fs.existsSync(f)) { console.log('minify-tizno: no hay dist/tizno-ai.html, nada que hacer'); process.exit(0); }
let html = fs.readFileSync(f, 'utf8');
const antes = html.length;

html = html.replace(/<script(\s+type="module")?>([\s\S]*?)<\/script>/g, (m, mod, js) => {
  const out = esbuild.transformSync(js, { minify: true, target: 'es2020' });
  return `<script${mod || ''}>${out.code}</script>`;
});
// comentarios HTML fuera (conserva los condicionales si los hubiera)
html = html.replace(/<!--(?!\[)[\s\S]*?-->/g, '');
// comentarios de CSS
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) =>
  '<style>' + css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n') + '</style>');

fs.writeFileSync(f, html);
console.log(`minify-tizno: ${(antes/1024).toFixed(0)} kB → ${(html.length/1024).toFixed(0)} kB`);
