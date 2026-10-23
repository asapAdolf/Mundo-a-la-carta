/**
 * Escritura de archivos: pantallas HTML en sus carpetas correspondientes,
 * index.html (Login) en la raíz, catálogo general en vistas/catalogo.html
 * e índice de búsqueda en js/pantallas-indice.js.
 */
const fs = require('fs');
const path = require('path');
const { P, SALIDA, RAIZ, esc } = require('./generar-pantallas');
const { shell, MODULOS, rutaDe, rel } = require('./lib');

/* Limpiar archivos HTML sueltos anteriores en vistas/ (conservando subcarpetas) */
if (fs.existsSync(SALIDA)) {
  for (const entrada of fs.readdirSync(SALIDA, { withFileTypes: true })) {
    if (entrada.isFile() && entrada.name.endsWith('.html')) {
      fs.unlinkSync(path.join(SALIDA, entrada.name));
    }
  }
}

/* Pantallas adicionales ya presentes en sus carpetas de módulo */
const EXTRAS = [
  { ruta: 'vistas/empleados/empleados.html', modulo: 'empleados', tituloPlano: 'Gestión de empleados (SPA interactiva)', codigo: 'CU_PA_01–04' },
  { ruta: 'vistas/comandas/cancelar-comanda.html', modulo: 'comanda', tituloPlano: 'Cancelar comanda (formulario gerente)', codigo: 'PA_09_02_01' },
];

const RUTA_CATALOGO = 'vistas/catalogo.html';

/* Construcción del catálogo agrupado por módulo */
const grupos = Object.keys(MODULOS).map((m) => {
  const listaModulo = [
    ...P.filter((p) => p.modulo === m).map((p) => ({
      href: rel(RUTA_CATALOGO, rutaDe(p)),
      titulo: p.tituloPlano,
      sub: p.codigo || rutaDe(p),
    })),
    ...EXTRAS.filter((x) => x.modulo === m).map((x) => ({
      href: rel(RUTA_CATALOGO, x.ruta),
      titulo: x.tituloPlano,
      sub: `${x.codigo} · ${x.ruta}`,
    })),
  ];

  const items = listaModulo.map((item) =>
    `<a class="pantalla-enlace" href="${item.href}"><strong>${esc(item.titulo)}</strong><small>${esc(item.sub)}</small></a>`).join('\n        ');

  return `    <section class="modulo">
      <h2><i class="fa-solid ${MODULOS[m].icono}"></i>${esc(MODULOS[m].label)}</h2>
      <div class="modulo-lista">
        ${items}
      </div>
    </section>`;
}).join('\n');

const totalPantallas = P.length + EXTRAS.length;

const catalogoPantalla = {
  archivo: 'catalogo.html',
  ruta: RUTA_CATALOGO,
  modulo: 'catalogo',
  tipo: 'catalogo',
  titulo: 'Catálogo de<br>pantallas',
  tituloPlano: 'Catálogo de pantallas',
  heroCompacto: true,
  cuerpo: `    <p class="catalogo-intro">Índice de las ${totalPantallas} pantallas del sistema (pantallas.pdf), organizadas por módulo en sus carpetas correspondientes.</p>\n${grupos}`,
};

const todas = [...P, catalogoPantalla];

todas.forEach((p) => {
  const destino = path.join(RAIZ, rutaDe(p));
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, shell(p, P));
});

/* Índice para el buscador del encabezado (rutas desde la raíz del proyecto) */
const indice = [
  ...P.map((p) => ({ ruta: rutaDe(p), titulo: p.tituloPlano })),
  ...EXTRAS.map((x) => ({ ruta: x.ruta, titulo: x.tituloPlano })),
  { ruta: RUTA_CATALOGO, titulo: 'Catálogo de pantallas' },
];

fs.writeFileSync(
  path.join(RAIZ, 'js', 'pantallas-indice.js'),
  `/* Generado por tools/generar-pantallas.js. No editar a mano. */\nwindow.MC_PANTALLAS = ${JSON.stringify(indice, null, 2)};\n`
);

console.log(`Generadas ${todas.length} pantallas (+ ${EXTRAS.length} pantallas de módulo existentes = ${totalPantallas} en total).`);
