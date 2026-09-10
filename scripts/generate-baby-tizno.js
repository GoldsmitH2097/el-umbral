/* Baby Tizno se GENERA en el build a partir del rig de Tizno
   (public/tizno-ai.html): misma criatura, otra piel y otro módulo de
   sesión. Nunca se edita a mano el resultado (dist/baby-tizno/index.html).
   Piezas propias: src/baby-tizno/baby.css, baby-ui.html y baby.js.
   Cada anclaje del rig se comprueba: si el rig cambia y un ancla
   desaparece, el build FALLA en voz alta en vez de servir una página rota. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => readFileSync(join(raiz, p), 'utf8');
let html = leer('public/tizno-ai.html');

function unaVez(texto, ancla, etiqueta) {
    const i = texto.indexOf(ancla);
    if (i < 0) throw new Error(`generate-baby-tizno: no encuentro el ancla «${etiqueta}»`);
    if (texto.indexOf(ancla, i + ancla.length) >= 0) throw new Error(`generate-baby-tizno: el ancla «${etiqueta}» aparece más de una vez`);
    return i;
}
function reemplazarTramo(texto, desde, hasta, nuevo, etiqueta) {
    const i = unaVez(texto, desde, etiqueta + ' (desde)');
    const j = texto.indexOf(hasta, i + desde.length);
    if (j < 0) throw new Error(`generate-baby-tizno: no encuentro el cierre de «${etiqueta}»`);
    return texto.slice(0, i) + nuevo + texto.slice(j + hasta.length);
}

// 1 · La puerta de entrada del <head>: solo /baby-tizno (y ?demo=1).
html = reemplazarTramo(html, '    <script>\n      /* LA PUERTA', '    </script>\n', `    <script>
      /* BABY TIZNO: una sola entrada, /baby-tizno (y ?demo=1 para el equipo). */
      const esBaby = /^\\/baby-tizno\\/?$/.test(location.pathname);
      if (!esBaby && !/[?&]demo=1/.test(location.search)) location.replace('/');
      document.documentElement.classList.add('estancia', 'baby');
      window.BABY = true;
    </script>
`, 'puerta del head');

// 2 · Título y metas: sin indexar, sin tarjeta social, sin canónica.
html = reemplazarTramo(html, '    <title>', '    <link rel="icon"', `    <title>Baby Tizno · prueba</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="description" content="Baby Tizno: cuentos de voz que inventa tu peque. Prueba privada." />
    <link rel="icon"`, 'título y metas');

// 3 · La piel de día, al final del <style> del rig.
const i3 = unaVez(html, '    </style>', 'cierre del style');
html = html.slice(0, i3) + leer('src/baby-tizno/baby.css') + html.slice(i3);

// 4 · Las capas de la zona de mayores, antes de la UI de llamada.
const ancla4 = '    <!-- ═══ ELEVENLABS 2/4 — call UI ═══ -->';
const i4 = unaVez(html, ancla4, 'call UI');
html = html.slice(0, i4) + leer('src/baby-tizno/baby-ui.html') + '\n' + html.slice(i4);

// 5 · El rig, casi intacto: sin sustos y solo dos sonidos enlatados (pop y ronroneo).
const a5 = 'function scareSfx() {';
html = html.slice(0, unaVez(html, a5, 'scareSfx')) + 'function scareSfx() {\n            if (window.BABY) return;' + html.slice(html.indexOf(a5) + a5.length);
const a6 = 'function sfxPlay(nombre) {';
html = html.slice(0, unaVez(html, a6, 'sfxPlay')) + "function sfxPlay(nombre) {\n            if (window.BABY && nombre !== 'pop' && nombre !== 'ronroneo') return false;" + html.slice(html.indexOf(a6) + a6.length);

// 6 · El módulo del SDK, entero, por el de Baby Tizno.
html = reemplazarTramo(html, '    <script type="module">', '    </script>\n</body>', '    <script type="module">\n' + leer('src/baby-tizno/baby.js') + '    </script>\n</body>', 'módulo del SDK');

// 7 · Compactar como hace minify-tizno (mismo peaje para copiar).
html = html.replace(/<script(\s+type="module")?>([\s\S]*?)<\/script>/g, (m, mod, js) => {
    const out = transformSync(js, { minify: true, target: 'es2020' });
    return `<script${mod || ''}>${out.code}</script>`;
});
html = html.replace(/<!--(?!\[)[\s\S]*?-->/g, '');
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n') + '</style>');

mkdirSync(join(raiz, 'dist', 'baby-tizno'), { recursive: true });
writeFileSync(join(raiz, 'dist', 'baby-tizno', 'index.html'), html);
console.log(`baby-tizno: /baby-tizno generado (${(html.length / 1024).toFixed(0)} kB).`);
