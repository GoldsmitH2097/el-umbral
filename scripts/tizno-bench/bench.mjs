// Mide el FPS real del rig (el data-fps que escribe medirFps) en Chrome headless
// con render por SOFTWARE (--disable-gpu), para comparar el coste de variantes
// del filtro. Ojo: --timeout / --virtual-time-budget no valen (el primero vuelca
// al cargar, el segundo no pinta fotogramas); por eso va por CDP y espera de
// verdad. Requiere srv.py en marcha. Node ≥ 22 (WebSocket nativo).
// Uso: node scripts/tizno-bench/bench.mjs <variante> [dpr=1] [segundos=16]
// Las variantes viven en scripts/tizno-bench/variantes/<nombre>.html: copias de
// public/tizno-ai.html con el filtro cambiado y un ratón sintético inyectado
// antes de </body> (sin ratón Tizno duerme hundido y no cuesta nada):
//   setInterval(()=>{ const x=innerWidth/2+Math.sin(t+=0.05)*260, y=innerHeight*0.55+Math.cos(t*0.7)*120;
//     for (const o of [window, document]) o.dispatchEvent(new MouseEvent('mousemove',{clientX:x,clientY:y,bubbles:true})); }, 50)
// Resultados 10-sep-2026 (dpr 1, 16 s, M-series): sin filtro de cuerpo 20 fps ·
// filtro original 12 · pelusa+humo 3 octavas 12 · 2 octavas 12 · con vaho a
// opacidad 0 → 6 (el vaho doblaba el coste aunque no se viera).
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
const [,, variante, dpr = '1', segundos = '16'] = process.argv;
if (!variante) { console.error('uso: node bench.mjs <variante> [dpr] [segundos]'); process.exit(2); }
const S = tmpdir();
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${S}/tizno-bench-profile-${port}`, '--window-size=1400,900',
  `--force-device-scale-factor=${dpr}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ver;
for (let i = 0; i < 40; i++) { try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(250); } }
if (!ver) { chrome.kill(); console.log(JSON.stringify({ variante, error: 'chrome no arranca' })); process.exit(1); }
const url = `http://127.0.0.1:4181/tizno/?nivel=alto&v=${variante}`;
const nuevo = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
const ws = new WebSocket(nuevo.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const errores = [];
const onmsg = ws.onmessage;
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errores.push((d.exception && d.exception.description || d.text || '').split('\n')[0].slice(0, 160)); } onmsg(e); };
await send('Runtime.enable');
await send('Performance.enable');
await sleep(Number(segundos) * 1000);
const ev = await send('Runtime.evaluate', { expression: `JSON.stringify({fps: document.documentElement.dataset.fps, nivel: document.documentElement.dataset.nivel, rig: (document.querySelector('.master-rig')||{}).style?.transform, filtro: (document.querySelectorAll('.goo-layer')[0]||{}).style?.filter})`, returnByValue: true });
const met = await send('Performance.getMetrics');
const g = (n) => (met.metrics.find(m => m.name === n) || {}).value;
const r = JSON.parse(ev.result.value);
console.log(JSON.stringify({ variante, dpr: Number(dpr), fps: Number(r.fps), nivel: r.nivel, rig: r.rig, filtro: r.filtro, mainThreadS: +g('TaskDuration').toFixed(2), scriptS: +g('ScriptDuration').toFixed(2), styleS: +g('RecalcStyleDuration').toFixed(2), layoutS: +g('LayoutDuration').toFixed(2), errores: errores.slice(0, 5), nErrores: errores.length }));
ws.close(); chrome.kill('SIGKILL');
