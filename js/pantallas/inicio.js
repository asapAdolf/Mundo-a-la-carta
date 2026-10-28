/**
 * inicio.js - Catálogo público (index.html): experiencias, carta y souvenirs con
 * filtros, orden y paginación. Requiere datos.js, comun.js y carrito.js.
 *
 * El estado del catálogo vive en la URL (?tipo=&q=&orden=&pagina=) para que cada
 * página se pueda compartir, recargar y recorrer con Atrás / Adelante.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var POR_PAGINA = 8;
  var grid = document.getElementById('catalogo-grid');
  var nav = document.getElementById('catalogo-paginacion');
  var totalEl = document.getElementById('catalogo-total');
  var q = document.getElementById('filtro-q');
  var orden = document.getElementById('filtro-orden');
  var chips = document.querySelectorAll('.chip[data-tipo]');
  var catalogo = [];
  var espera;

  /* Une las tres colecciones en un formato común de tarjeta */
  function cargarCatalogo() {
    return Promise.all([
      MC.datos.listar('experiencias', { filtro: { estado: 'Activo' } }),
      MC.datos.listar('productos', { filtro: { estado: 'Activo' } }),
      MC.datos.listar('souvenirs', { filtro: { estado: 'Activo' } })
    ]).then(function (r) {
      var exp = r[0].items.map(function (e) {
        return { id: e.folio, tipo: 'Experiencia', nombre: e.nombre, categoria: e.ambientacion, descripcion: e.descripcion, precio: e.precio, sufijo: ' / persona', icono: e.icono, destacado: 0, ambientacion: e.ambientacion };
      });
      var carta = r[1].items.map(function (p) {
        return { id: p.folio, tipo: 'Carta', nombre: p.nombre, categoria: p.categoria, descripcion: p.categoria + ' de la carta', precio: p.precio, icono: p.icono, destacado: 1 };
      });
      var souv = r[2].items.map(function (s) {
        var hay = Number(s.existencia) > 0;
        return { id: s.folio, tipo: 'Souvenir', nombre: s.nombre, categoria: s.departamento, descripcion: s.descripcion || s.departamento, precio: Number(s['precio-por-unidad']), icono: 'fa-gift', destacado: 2, disponible: hay };
      });
      catalogo = exp.concat(carta, souv);
    });
  }

  function leerEstado() {
    var p = new URLSearchParams(window.location.search);
    return { tipo: p.get('tipo') || '', q: p.get('q') || '', orden: p.get('orden') || '', pagina: Math.max(1, parseInt(p.get('pagina'), 10) || 1) };
  }

  /* pushState solo al cambiar de página; los filtros reemplazan la entrada actual */
  function escribirEstado(e, nueva) {
    var p = new URLSearchParams();
    if (e.tipo) p.set('tipo', e.tipo);
    if (e.q) p.set('q', e.q);
    if (e.orden) p.set('orden', e.orden);
    if (e.pagina > 1) p.set('pagina', e.pagina);
    var url = 'index.html' + (p.toString() ? '?' + p.toString() : '');
    if (nueva) history.pushState(null, '', url); else history.replaceState(null, '', url);
  }

  var normal = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };

  function tarjeta(i) {
    var accion;
    if (i.tipo === 'Carta') accion = '<button type="button" class="btn-primary" data-agregar="' + MC.esc(i.id) + '"><i class="fa-solid fa-cart-plus"></i> Agregar</button>';
    else if (i.tipo === 'Experiencia') accion = '<a class="btn-primary" href="vistas/reservas/reservacion-crear.html" data-experiencia="' + MC.esc(i.ambientacion) + '">Reservar</a>';
    else accion = '<span class="insignia ' + (i.disponible ? 'insignia--ok' : 'insignia--mal') + '">' + (i.disponible ? 'En tienda' : 'Agotado') + '</span>';
    return '<article class="item">' +
      '<div class="item-imagen"><i class="fa-solid ' + MC.esc(i.icono) + '" aria-hidden="true"></i></div>' +
      '<div class="item-cuerpo"><span class="insignia item-tipo">' + MC.esc(i.tipo === 'Carta' ? i.categoria : i.tipo) + '</span>' +
      '<h3>' + MC.esc(i.nombre) + '</h3><p>' + MC.esc(i.descripcion) + '</p>' +
      '<div class="item-pie"><span class="item-precio">' + MC.dinero(i.precio) + (i.sufijo ? '<small>' + i.sufijo + '</small>' : '') + '</span>' + accion + '</div></div></article>';
  }

  function pintar(desplazar) {
    var e = leerEstado();
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-tipo') === e.tipo)); });
    if (document.activeElement !== q) q.value = e.q;
    orden.value = e.orden;

    var nq = normal(e.q);
    var lista = catalogo.filter(function (i) {
      return (!e.tipo || i.tipo === e.tipo) && (!nq || normal(i.nombre + ' ' + i.categoria + ' ' + i.descripcion).indexOf(nq) !== -1);
    });
    var ordenes = {
      'precio-asc': function (a, b) { return a.precio - b.precio; },
      'precio-desc': function (a, b) { return b.precio - a.precio; },
      nombre: function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }
    };
    lista.sort(ordenes[e.orden] || function (a, b) { return a.destacado - b.destacado; });

    var paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    var pagina = Math.min(e.pagina, paginas);
    var visibles = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    grid.innerHTML = visibles.length ? visibles.map(tarjeta).join('')
      : '<div class="catalogo-vacio"><p>No encontramos resultados para tu búsqueda.</p><button type="button" class="btn-secondary" data-limpiar>Limpiar filtros</button></div>';
    totalEl.textContent = lista.length ? 'Mostrando ' + MC.rangoPagina({ total: lista.length, pagina: pagina, porPagina: POR_PAGINA, items: visibles }) : '';
    nav.innerHTML = paginas > 1 ? MC.paginador(pagina, paginas) : '';
    if (desplazar) document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cambiar(cambios, nuevaEntrada) {
    var e = leerEstado();
    Object.keys(cambios).forEach(function (k) { e[k] = cambios[k]; });
    if (!('pagina' in cambios)) e.pagina = 1; // un filtro nuevo siempre regresa a la página 1
    escribirEstado(e, nuevaEntrada);
    pintar(nuevaEntrada);
  }

  chips.forEach(function (c) { c.addEventListener('click', function () { cambiar({ tipo: c.getAttribute('data-tipo') }); }); });
  q.addEventListener('input', function () {
    clearTimeout(espera);
    espera = setTimeout(function () { cambiar({ q: q.value.trim() }); }, 250); // debounce
  });
  orden.addEventListener('change', function () { cambiar({ orden: orden.value }); });
  nav.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-pagina]');
    if (b && !b.disabled) cambiar({ pagina: Number(b.getAttribute('data-pagina')) }, true);
  });
  window.addEventListener('popstate', function () { pintar(false); });

  grid.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-limpiar]')) return cambiar({ tipo: '', q: '', orden: '' });
    var agregar = ev.target.closest('[data-agregar]');
    if (agregar) {
      var p = catalogo.find(function (i) { return i.tipo === 'Carta' && i.id === agregar.getAttribute('data-agregar'); });
      MC.carrito.cambiar({ id: p.id, nombre: p.nombre, precio: p.precio }, MC.carrito.cantidad(p.id) + 1);
      MC.actualizarContadorCarrito();
      return MC.toast(p.nombre + ' agregado al carrito', 'success');
    }
    /* Reservar una experiencia: deja la ambientación elegida en el borrador de la reservación */
    var exp = ev.target.closest('[data-experiencia]');
    if (exp) {
      var borrador = MC.temporal.leer('reserva_reservacion') || {};
      borrador.ambientacion = exp.getAttribute('data-experiencia');
      MC.temporal.guardar('reserva_reservacion', borrador);
    }
  });

  cargarCatalogo().then(function () { pintar(false); });
})();
