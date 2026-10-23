/**
 * tools/lib.js - Utilidades del generador de pantallas.
 * Construye campos, botones, modales y el "shell" común (encabezado, menús, pie)
 * calculando rutas relativas según la carpeta de cada módulo.
 */
const path = require('path');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = (s) =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/* Carpeta de cada módulo dentro de vistas/ */
const MODULOS = {
  auth:       { label: 'Acceso y cuenta',        icono: 'fa-right-to-bracket', carpeta: 'vistas/auth' },
  usuario:    { label: 'Usuarios',               icono: 'fa-users',            carpeta: 'vistas/usuarios' },
  souvenir:   { label: 'Souvenirs',              icono: 'fa-gift',             carpeta: 'vistas/souvenirs' },
  empleados:  { label: 'Roles / empleados',      icono: 'fa-user-tie',         carpeta: 'vistas/empleados' },
  transporte: { label: 'Transporte',             icono: 'fa-van-shuttle',      carpeta: 'vistas/transporte' },
  reservas:   { label: 'Reservaciones',          icono: 'fa-calendar-check',   carpeta: 'vistas/reservas' },
  carta:      { label: 'Carta y pagos',          icono: 'fa-utensils',         carpeta: 'vistas/carta' },
  ventas:     { label: 'Venta de souvenirs',     icono: 'fa-cash-register',    carpeta: 'vistas/ventas' },
  comanda:    { label: 'Comandas (Mesero)',      icono: 'fa-clipboard-list',   carpeta: 'vistas/comandas' },
  compras:    { label: 'Compras y devoluciones', icono: 'fa-cart-flatbed',     carpeta: 'vistas/compras' },
};

function rutaDe(p) {
  if (p.ruta) return p.ruta;
  const mod = MODULOS[p.modulo];
  return mod ? `${mod.carpeta}/${p.archivo}` : `vistas/${p.archivo}`;
}

function rel(desdeRuta, haciaRuta) {
  const dir = path.posix.dirname(desdeRuta);
  const r = path.posix.relative(dir === '.' ? '' : dir, haciaRuta);
  return r || '.';
}

/* ---------- Campos ---------- */
function campo(label, tipo, o = {}) {
  const req = (/\*\s*$/.test(label) || o.req) && !o.ro;
  const ro = /\(i\)/.test(label) || !!o.ro;
  const txt = label.replace(/\*|\(i\)/g, '').trim();
  const id = o.id || slug(txt);
  const n = (tipo.match(/\((\d+)/) || [])[1];
  const attrs = `id="${id}" name="${id}"${req ? ' required' : ''}${ro ? ' readonly' : ''}`;
  const val = o.v !== undefined ? ` value="${esc(o.v)}"` : '';
  const ph = o.ph !== undefined ? o.ph : '';
  let control = '';
  let ayuda = '';

  if (o.sel) {
    const ops = o.sel.map((x) => `<option${o.v === x ? ' selected' : ''}>${esc(x)}</option>`).join('');
    control = `<select class="input-custom" id="${id}" name="${id}"${req ? ' required' : ''}${ro ? ' disabled' : ''}>` +
      `<option value=""${o.v ? '' : ' selected'}>${esc(o.ph || 'Selecciona...')}</option>${ops}</select>`;
  } else if (tipo === 'bool') {
    control = `<label class="interruptor"><input type="checkbox" id="${id}" name="${id}"${o.v ? ' checked' : ''}${ro ? ' disabled' : ''}>` +
      `<span class="pista"></span><span>Sí</span></label>`;
  } else if (tipo.startsWith('ta')) {
    control = `<textarea class="input-custom" ${attrs} maxlength="${n || 300}" placeholder="${esc(ph)}">${esc(o.v || '')}</textarea>`;
    ayuda = `Texto · máx. ${n || 300} caracteres`;
  } else {
    let type = 'text';
    let extra = '';
    if (tipo.startsWith('int')) { extra = ` inputmode="numeric" pattern="[0-9]*" maxlength="${n}"`; ayuda = `Numérico entero · máx. ${n} dígitos`; }
    else if (tipo.startsWith('d') && tipo !== 'date') { extra = ' inputmode="decimal"'; ayuda = 'Numérico decimal'; }
    else if (tipo === 'date') { type = 'date'; }
    else if (tipo === 'time') { type = 'time'; }
    else if (tipo === 'pass') { type = 'password'; extra = ' autocomplete="current-password"'; }
    else if (tipo === 'email') { type = 'email'; extra = ` maxlength="${n || 150}"`; ayuda = `Correo · máx. ${n || 150} caracteres`; }
    else if (tipo === 'tel') { type = 'tel'; extra = ` inputmode="tel" maxlength="${n || 12}"`; ayuda = `Teléfono · máx. ${n || 12} dígitos`; }
    else if (tipo.startsWith('s')) { extra = ` maxlength="${n}"`; ayuda = `Texto · máx. ${n} caracteres`; }
    control = `<input class="input-custom" type="${type}" ${attrs}${val}${extra}${ph ? ` placeholder="${esc(ph)}"` : ''}>`;
  }
  if (o.sinAyuda || ro) ayuda = o.ayuda || '';
  if (o.ayuda) ayuda = o.ayuda;

  const marca = (req ? ' <span class="req">*</span>' : '') +
    (ro ? ' <i class="fa-solid fa-circle-info dato-info" title="Dato informativo (solo lectura)"></i>' : '');
  const span = o.span ? ` style="grid-column: span ${o.span}"` : '';
  return `<div class="campo-grupo${o.ancho ? ' campo-grupo--ancho' : ''}"${span}>` +
    `<label for="${id}">${esc(txt)}${marca}</label>${control}${ayuda ? `<small class="ayuda">${esc(ayuda)}</small>` : ''}</div>`;
}

const render = (defs, { soloLectura = false, muestra = {} } = {}) =>
  defs.map(([label, tipo, o = {}]) => {
    const id = o.id || slug(label.replace(/\*|\(i\)/g, '').trim());
    const op = { ...o };
    if (muestra[id] !== undefined && op.v === undefined) op.v = muestra[id];
    if (soloLectura && !o.libre) op.ro = true;
    return campo(label, tipo, op);
  }).join('\n');

const folio = (label, valor = 'Automático') =>
  `<div class="folio"><span>${esc(label)} <i class="fa-solid fa-circle-info dato-info" title="Generado por el sistema"></i></span><strong>${esc(valor)}</strong></div>`;

const foto = (texto, icono = 'fa-user') =>
  `<label class="subir-foto"><input type="file" accept="image/*" data-previsualizar>` +
  `<span class="avatar"><i class="fa-solid ${icono}"></i></span><span>${esc(texto)}</span></label>`;

/* ---------- Botones ---------- */
function btn(texto, o = {}) {
  const clase = { primary: 'btn-primary', secondary: 'btn-secondary', danger: 'btn-danger', ghost: 'btn-ghost' }[o.tipo || 'primary'];
  const a = [`type="${o.submit ? 'submit' : 'button'}"`, `class="${clase}"`];
  if (o.id) a.push(`id="${o.id}"`);
  if (o.ir) a.push(`data-ir="${o.ir}"`);
  if (o.toast) a.push(`data-toast="${esc(o.toast)}"`);
  if (o.toastTipo) a.push(`data-toast-tipo="${o.toastTipo}"`);
  if (o.modal) a.push(`data-modal-abrir="${o.modal}"`);
  if (o.cerrar) a.push('data-modal-cerrar');
  if (o.dis) a.push('disabled');
  if (o.attr) a.push(o.attr);
  return `<button ${a.join(' ')}>${o.icono ? `<i class="fa-solid ${o.icono}"></i> ` : ''}${esc(texto)}</button>`;
}
const acciones = (botones, clase = '') => `<div class="acciones ${clase}">${botones.join('\n')}</div>`;

/* ---------- Modal ---------- */
const modal = ({ id, titulo, texto, abierto = false, botones }) =>
  `<div class="modal-backdrop${abierto ? ' open' : ''}" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-t">
  <div class="modal-dialog">
    <h2 id="${id}-t" style="margin:0 0 .5rem;font-size:1.25rem;font-weight:800">${esc(titulo)}</h2>
    <p style="margin:0 0 1.25rem;color:#4b5563">${texto}</p>
    <div class="acciones acciones--fin" style="margin-top:0">${botones.join('\n')}</div>
  </div>
</div>`;

/* ---------- Shell común ---------- */
const ONDA = 'M0 120L48 105C96 90 192 60 288 45C384 30 480 30 576 40C672 50 768 70 864 75C960 80 1056 70 1152 55C1248 40 1344 20 1392 10L1440 0V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z';

function shell(p, todas) {
  const miRuta = rutaDe(p);
  const hacia = (destinoRuta) => rel(miRuta, destinoRuta);
  const primero = (m) => {
    const hit = todas.find((x) => x.modulo === m);
    return hit ? hacia(rutaDe(hit)) : hacia('vistas/catalogo.html');
  };

  const menu = Object.keys(MODULOS).map((m) =>
    `<a href="${primero(m)}"><i class="fa-solid ${MODULOS[m].icono}"></i>${esc(MODULOS[m].label)}</a>`).join('\n      ') +
    `\n      <a href="${hacia('vistas/catalogo.html')}"><i class="fa-solid fa-table-list"></i>Catálogo de pantallas</a>`;

  const accionesHtml = `<div class="topbar-acciones">
      <button type="button" aria-label="Búsqueda" data-alternar="buscador"><i class="fa-solid fa-magnifying-glass"></i></button>
      <button type="button" aria-label="Menú" data-alternar="menu-hamburguesa"><i class="fa-solid fa-bars"></i></button>
    </div>`;
  const marca = `<a class="marca" href="${hacia('vistas/catalogo.html')}"><i class="fa-solid fa-globe" aria-hidden="true"></i><div>MUNDO<span> A LA CARTA</span></div></a>`;

  let hero;
  if (p.hero === 'comanda') {
    hero = `<header class="hero hero--comanda bg-wave">
    <div class="topbar">${marca}
      <div class="rol-activo"><span class="activo">Mesero</span><span>Comandera</span></div>
      ${accionesHtml}
    </div>
    <h1 class="hero-titulo">${p.titulo}</h1>
    <p class="codigo-pantalla">${esc(p.codigo || '')} ${esc(p.tituloPlano)}</p>
  </header>`;
  } else {
    const navHref = p.nav === 'Roles'
      ? hacia('vistas/empleados/rol-crear.html')
      : p.nav === 'Login'
        ? hacia('index.html')
        : p.nav ? primero(p.modulo) : '';
    const nav = p.nav ? `<a class="activo" href="${navHref}">${esc(p.nav)}</a>` : '';
    hero = `<header class="hero ${p.heroCompacto ? 'hero--compacto ' : ''}bg-wave">
    <div class="topbar">${marca}
      <nav class="nav-principal" aria-label="Principal">
        ${nav}
        <a href="${hacia('vistas/catalogo.html')}">Inicio</a>
        <a href="${hacia('vistas/carta/carta.html')}">Experiencias</a>
        <a href="#" data-toast="Contacto: contacto@mundoalacarta.mx · 55 0000 0000">Contacto</a>
      </nav>
      ${accionesHtml}
    </div>
    ${p.titulo ? `<h1 class="hero-titulo">${p.titulo}</h1>` : ''}
    <svg class="hero-onda" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="${ONDA}" fill="#fff"/></svg>
  </header>`;
  }

  const cssArchivos = ['css/styles.css', 'css/layout.css', ...(p.cssExtra || []).map((x) => `css/pantallas/${x}.css`), `css/pantallas/${p.tipo}.css`];
  const css = cssArchivos.map((c) => `<link rel="stylesheet" href="${hacia(c)}">`).join('\n    ');

  const jsArchivos = ['js/pantallas-indice.js', 'js/comun.js', ...(p.scripts || []).map((s) => `js/${s}`)];
  const js = jsArchivos.map((s) => `<script src="${hacia(s)}"></script>`).join('\n    ');

  const dataRaiz = hacia('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mundo a la Carta - ${esc(p.tituloPlano)}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    ${css}
</head>
<body class="pantalla pantalla--${p.tipo}" data-raiz="${dataRaiz}">
<div class="app">
  ${hero}
  <div class="buscador" id="buscador"><form role="search"><input class="input-custom" type="search" placeholder="Buscar pantalla..." aria-label="Buscar pantalla"></form></div>
  <nav class="menu-hamburguesa" id="menu-hamburguesa" aria-label="Menú">
      ${menu}
  </nav>

  <main class="contenido">
${p.cuerpo}
  </main>

  <footer class="pie">${esc(p.codigo ? `${p.codigo} · ` : '')}${esc(p.tituloPlano)}</footer>
</div>
${p.extra || ''}
<div id="toast-container" aria-live="polite"></div>
    ${js}
</body>
</html>
`;
}

module.exports = { esc, slug, campo, render, folio, foto, btn, acciones, modal, shell, MODULOS, rutaDe, rel };
