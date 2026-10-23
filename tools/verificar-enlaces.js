/**
 * tools/verificar-enlaces.js - Comprueba que los enlaces internos de index.html
 * y de todas las carpetas dentro de /vistas existan.
 * Uso: node tools/verificar-enlaces.js
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');

function listarHtml(dir) {
  let res = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) res = res.concat(listarHtml(full));
    else if (ent.isFile() && ent.name.endsWith('.html')) res.push(full);
  }
  return res;
}

const archivos = [path.join(raiz, 'index.html'), ...listarHtml(path.join(raiz, 'vistas'))];
let rotos = 0;

for (const archivo of archivos) {
  const html = fs.readFileSync(archivo, 'utf8');
  const baseDir = path.dirname(archivo);
  const re = /(?:href|data-ir|src)="([^"#]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (/^(https?:|back$|javascript)/.test(u)) continue;
    const destino = path.resolve(baseDir, u);
    if (!fs.existsSync(destino)) {
      rotos++;
      console.log(`${path.relative(raiz, archivo)} -> ${u}`);
    }
  }
}

console.log(`Archivos HTML revisados: ${archivos.length} · Enlaces rotos: ${rotos}`);
process.exit(rotos ? 1 : 0);
