/**
 * server.js - Servidor HTTP y API REST (Zero Dependencies externas)
 * Diseñado para servir la SPA y la API REST conectada a SQLite.
 * Compatible con despliegue en Render, Railway o local.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { manejarApi } = require('./api');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Sanitizar URL y resolver archivo
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Ruta de API o Health Check
  if (pathname.startsWith('/api/') || pathname === '/api' || pathname === '/health') {
    const query = Object.fromEntries(parsedUrl.searchParams.entries());
    const apiPath = pathname === '/health' ? '/api/health' : pathname;
    return manejarApi(req, res, apiPath, query);
  }

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(path.join(ROOT, pathname));

  // Prevenir Directory Traversal
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Prohibido');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback a index.html para comportamiento SPA
      const fallbackFile = path.join(ROOT, 'index.html');
      fs.readFile(fallbackFile, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 No encontrado');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(safePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Error interno del servidor');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  🌐 Mundo a la Carta - Servidor y API REST`);
  console.log(`  Servidor activo en: http://0.0.0.0:${PORT}`);
  console.log(`  API Health check:   http://0.0.0.0:${PORT}/api/health`);
  console.log(`  Catálogo de vistas: http://0.0.0.0:${PORT}/vistas/catalogo.html`);
  console.log(`  Presiona Ctrl + C para detener el servidor`);
  console.log(`======================================================\n`);
});
