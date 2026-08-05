/**
 * Diagnostico.js — el panel que convierte «va lento» en un número.
 *
 * Se enciende SOLO con ?diag=1 en la URL. Ningún visitante lo verá jamás, y
 * si no está activo este módulo no cuesta nada: se sale en la primera línea.
 *
 * Existe porque medir a distancia es el cuello de botella de todo el trabajo
 * de rendimiento en móvil: no hay Task Manager en un iPhone, y conectar el
 * cable para una sola cifra es una ceremonia. Con esto se abre la URL en el
 * teléfono, se mira y se manda una captura.
 *
 * Los fps de Tizno NO se calculan aquí: su motor ya se cronometra a sí mismo
 * y publica el resultado en el dataset de su documento. Como el marco es del
 * mismo origen, basta con leerlo — así el panel no interfiere en lo que mide.
 */

const PANEL_ID = 'panel-diag';

export function initDiagnostico() {
  if (!/[?&]diag=1/.test(location.search)) return;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="diag-fila diag-cabecera"><b>DIAGNÓSTICO</b><span id="diag-plegar">▾</span></div>
    <div id="diag-cuerpo">
      <div class="diag-fila"><span>fps página</span><b id="diag-fps">—</b></div>
      <div class="diag-fila"><span>fps Tizno</span><b id="diag-fps-tizno">—</b></div>
      <div class="diag-fila"><span>peor fotograma</span><b id="diag-peor">—</b></div>
      <div class="diag-fila"><span>vídeos con fuente</span><b id="diag-videos">—</b></div>
      <div class="diag-fila"><span>lienzos</span><b id="diag-lienzos">—</b></div>
      <div class="diag-fila"><span>animaciones vivas</span><b id="diag-anim">—</b></div>
      <button type="button" id="diag-censo">recontar animaciones</button>
    </div>`;
  document.body.appendChild(panel);

  const $ = (id) => document.getElementById(id);
  $('diag-plegar').parentElement.addEventListener('click', () => {
    const c = $('diag-cuerpo');
    const oculto = c.style.display === 'none';
    c.style.display = oculto ? '' : 'none';
    $('diag-plegar').textContent = oculto ? '▾' : '▸';
  });

  /* ── Los fps de esta página ──────────────────────────────────────────────
     Se miden por ventanas de un segundo. El peor fotograma dice más que la
     media: 60 fps de media con un pico de 300 ms es una web que da tirones,
     y la media sola lo esconde. */
  let cuadros = 0, t0 = performance.now(), prev = t0, peor = 0;
  const latir = (ahora) => {
    cuadros++;
    peor = Math.max(peor, ahora - prev);
    prev = ahora;
    if (ahora - t0 >= 1000) {
      $('diag-fps').textContent = Math.round(cuadros / ((ahora - t0) / 1000));
      $('diag-peor').textContent = Math.round(peor) + ' ms';
      cuadros = 0; t0 = ahora; peor = 0;
    }
    requestAnimationFrame(latir);
  };
  requestAnimationFrame(latir);

  const censar = () => {
    let vivas = 0;
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      if (!(s.animationIterationCount || '').includes('infinite')) continue;
      if ((s.animationPlayState || '').includes('paused')) continue;
      vivas++;
    }
    $('diag-anim').textContent = vivas;
  };
  $('diag-censo').addEventListener('click', censar);

  setInterval(() => {
    // Tizno se cronometra solo; aquí solo se recoge su cifra.
    const marco = document.getElementById('tizno-frame');
    let fpsT = '—';
    try {
      const d = marco?.contentDocument?.documentElement?.dataset?.fps;
      if (d) fpsT = d;
      else if (marco) fpsT = 'sin dato';
    } catch (_) { fpsT = 'sin acceso'; }
    $('diag-fps-tizno').textContent = marco ? fpsT : 'preso';

    const conFuente = [...document.querySelectorAll('video')].filter(v => v.getAttribute('src')).length;
    $('diag-videos').textContent = conFuente + ' / ' + document.querySelectorAll('video').length;

    const lienzos = [...document.querySelectorAll('canvas')]
      .filter(c => getComputedStyle(c).display !== 'none');
    $('diag-lienzos').textContent = lienzos.length
      ? lienzos.map(c => c.width + '×' + c.height).join('  ')
      : '0';
  }, 1000);

  censar();
}
