/**
 * comanda.js - Mesas, crear comanda y aviso / resumen de cancelación (rol Mesero).
 * Requiere datos.js y comun.js.
 *
 * Mesas → (mesa libre u ocupada) → comanda-crear.html?mesa=A3
 * Las líneas aún no enviadas se pueden quitar libremente; las ya enviadas a cocina
 * solo se cancelan con autorización de gerente (cancelar-comanda.html).
 */
(function () {
  'use strict';
  var MC = window.MC;
  var archivo = (window.location.pathname.split('/').pop() || '').replace('.html', '');
  var $ = function (id) { return document.getElementById(id); };
  var sesion = MC.sesion.actual();
  var ABIERTA = function (c) { return c.estado === 'Abierta' || c.estado === 'Enviada'; };

  var PLATILLOS = {
    'Bebidas': [['Refresco', 40], ['Agua mineral', 35], ['Limonada', 45], ['Naranjada', 45], ['Té helado', 40]],
    'Mar y Tierra': [['Mar y Tierra', 189], ['Camarones al ajillo', 165], ['Filete de res', 210]],
    'Pastas': [['Spaghetti boloñesa', 120], ['Fettuccine Alfredo', 130], ['Lasaña', 140]],
    'Pizzas': [['Pizza margarita', 150], ['Pizza pepperoni', 165], ['Pizza hawaiana', 160]],
    'Sopas': [['Sopa de tortilla', 85], ['Crema de champiñones', 80]],
    'Croisssants': [['Croissant jamón y queso', 75], ['Croissant de chocolate', 60]],
    'Molletes': [['Mollete clásico', 65], ['Mollete con chorizo', 75]],
    'Tapas': [['Tapas variadas', 110], ['Tapa de jamón serrano', 120]],
    'Crepas': [['Crepa de cajeta', 70], ['Crepa de Nutella', 80], ['Crepa de jamón', 85]],
    'Paninos': [['Panino de Milanesa', 92], ['Panino caprese', 88]],
    'Cafe': [['Café americano', 38], ['Capuchino', 48], ['Latte', 50], ['Espresso', 35]],
    'Cocteleria': [['Margarita', 95], ['Mojito', 95], ['Piña colada', 105]]
  };
  var POR_PAGINA = 12;

  /* ======================================================================
     MESAS
     ====================================================================== */
  if (archivo === 'mesas') {
    var mesaSel = $('mesa-seleccionada');
    var abrir = $('btn-abrir-mesa');
    var elegida = null;
    var meseroEl = document.querySelector('.mesas-cab em');
    if (meseroEl && sesion) meseroEl.textContent = sesion.nombre;
    MC.datos.listar('mesas').then(function (res) {
      var estados = {};
      res.items.forEach(function (m) { estados[m.folio] = m; });
      document.querySelectorAll('.mesa').forEach(function (b) {
        var m = estados[b.textContent.trim()] || {};
        var ocupada = m.estado === 'Ocupada';
        b.disabled = false;
        b.classList.toggle('ocupada', ocupada);
        b.style.cursor = 'pointer';
        b.title = ocupada ? 'Mesa ocupada · abrir su comanda' : 'Mesa libre';
      });
    });
    document.querySelectorAll('.mesa').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.mesa').forEach(function (x) { x.classList.remove('seleccionada'); });
        b.classList.add('seleccionada');
        elegida = b.textContent.trim();
        mesaSel.textContent = elegida + (b.classList.contains('ocupada') ? ' (ocupada, se abrirá su comanda)' : '');
        abrir.disabled = false;
      });
    });
    MC.tomarBoton(abrir, function () {
      if (elegida) MC.ir('comanda-crear.html?mesa=' + encodeURIComponent(elegida));
    });
    return;
  }

  /* ======================================================================
     RESUMEN DE CANCELACIÓN
     ====================================================================== */
  if (archivo === 'comanda-cancelar-resumen') {
    var canc = MC.temporal.leer('cancelacion');
    var dl = document.querySelector('.lista-dl');
    var poner = function (etq, v) {
      var dt = Array.prototype.find.call(dl.querySelectorAll('dt'), function (x) { return x.textContent.trim() === etq; });
      if (dt) dt.nextElementSibling.textContent = v;
    };
    if (!canc) {
      MC.toast('No hay una cancelación en curso', 'info');
    } else {
      poner('Fecha', canc.fecha); poner('Folio', canc.folio); poner('Mesa', canc.mesa);
      poner('Motivo de cancelación', canc.motivo); poner('Alimentos', canc.alimentos);
      poner('Detalle de alimentos', canc.detalle); poner('Cantidad', canc.cantidad);
    }
    MC.tomarBoton(document.querySelector('.acciones .btn-primary'), function () {
      MC.temporal.borrar('cancelacion');
      MC.toast('Cancelación confirmada', 'success');
      MC.ir(canc && !canc.total ? 'comanda-crear.html?mesa=' + encodeURIComponent(canc.mesa) : 'mesas.html', 700);
    });
    return;
  }

  /* ======================================================================
     CREAR COMANDA (y vista de aviso de cancelación)
     ====================================================================== */
  var cuerpo = $('lineas-comanda');
  if (!cuerpo) return;
  var aviso = archivo === 'comanda-cancelar-aviso';
  var totalEl = $('total-comanda');
  var categoriasEl = document.querySelector('.categorias');
  var cabecera = document.querySelector('.panel-comanda-cab > span:first-child');
  var pie = document.querySelectorAll('.comanda-pie em');
  var mesa = MC.param('mesa');
  var comanda = null; // registro guardado
  var lineas = [];
  var pendiente = false; // hay líneas sin enviar a cocina
  var vista = { categoria: null, pagina: 1 };

  function pintar() {
    var suma = 0;
    cuerpo.innerHTML = lineas.length ? lineas.map(function (l, i) {
      suma += l.precio * l.cantidad;
      var titulo = l.enviada ? 'Cancelar (requiere gerente)' : 'Eliminar';
      return '<tr><td>' + MC.dinero(l.precio) + '</td><td>' + l.cantidad + '</td><td class="nombre">' + MC.esc(l.nombre) +
        (l.enviada ? ' <small title="Enviado a cocina"><i class="fa-solid fa-fire-burner"></i></small>' : '') +
        '</td><td>' + (aviso ? '' : '<button type="button" class="borrar" data-i="' + i + '" aria-label="' + titulo + '" title="' + titulo + '"><i class="fa-solid fa-trash-can"></i></button>') + '</td></tr>';
    }).join('') : '<tr class="sin-lineas"><td colspan="4">Selecciona una categoría para agregar alimentos</td></tr>';
    totalEl.textContent = MC.dinero(suma);
  }

  /* Opciones de alimentos con paginación (< >) */
  function opciones() {
    if (!vista.categoria) return Object.keys(PLATILLOS).map(function (c) { return { texto: c, categoria: c }; });
    return PLATILLOS[vista.categoria].map(function (p) { return { texto: p[0] + ' · ' + MC.dinero(p[1]), platillo: p }; });
  }
  function pintarOpciones() {
    var ops = opciones();
    var paginas = Math.max(1, Math.ceil(ops.length / POR_PAGINA));
    vista.pagina = Math.min(vista.pagina, paginas);
    var visibles = ops.slice((vista.pagina - 1) * POR_PAGINA, vista.pagina * POR_PAGINA);
    categoriasEl.innerHTML = (vista.categoria ? '<button type="button" class="categoria" data-volver><i class="fa-solid fa-arrow-left"></i> Categorías</button>' : '') +
      visibles.map(function (o, i) {
        return '<button type="button" class="categoria" data-op="' + ((vista.pagina - 1) * POR_PAGINA + i) + '">' + MC.esc(o.texto) + '</button>';
      }).join('');
    cabecera.textContent = vista.categoria ? vista.categoria : 'Opciones de alimentos';
    var flechas = document.querySelectorAll('.panel-comanda-cab button');
    flechas[0].disabled = vista.pagina <= 1 && !vista.categoria;
    flechas[1].disabled = vista.pagina >= paginas;
  }

  if (!aviso) {
    categoriasEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-volver]')) { vista = { categoria: null, pagina: 1 }; return pintarOpciones(); }
      var b = e.target.closest('[data-op]');
      if (!b) return;
      var o = opciones()[Number(b.getAttribute('data-op'))];
      if (o.categoria) { vista = { categoria: o.categoria, pagina: 1 }; return pintarOpciones(); }
      var existente = lineas.find(function (l) { return l.nombre === o.platillo[0] && !l.enviada; });
      if (existente) existente.cantidad++;
      else lineas.push({ nombre: o.platillo[0], precio: o.platillo[1], cantidad: 1, enviada: false });
      pendiente = true;
      MC.toast(o.platillo[0] + ' agregado', 'success');
      pintar();
    });
    var flechas = document.querySelectorAll('.panel-comanda-cab button');
    flechas[0].addEventListener('click', function () {
      if (vista.pagina > 1) vista.pagina--; else vista = { categoria: null, pagina: 1 };
      pintarOpciones();
    });
    flechas[1].addEventListener('click', function () { vista.pagina++; pintarOpciones(); });

    cuerpo.addEventListener('click', function (e) {
      var b = e.target.closest('.borrar');
      if (!b) return;
      var i = Number(b.dataset.i);
      if (!lineas[i].enviada) { lineas.splice(i, 1); pintar(); return; }
      if (pendiente) return MC.toast('Envía primero los alimentos nuevos a cocina', 'info');
      MC.ir('cancelar-comanda.html?folio=' + encodeURIComponent(comanda.folio) + '&linea=' + i);
    });
  }

  function cargar(c) {
    comanda = c;
    lineas = c ? JSON.parse(JSON.stringify(c.lineas)) : [];
    if (pie[0]) pie[0].textContent = c ? c.mesero : (sesion ? sesion.nombre : '');
    if (pie[1]) pie[1].textContent = mesa;
    pintar();
    pintarOpciones();
  }

  if (aviso) {
    MC.datos.obtener('comandas', MC.param('folio')).then(function (c) { mesa = c.mesa; cargar(c); }).catch(function () { cargar(null); });
    return;
  }

  if (!mesa) {
    MC.toast('Selecciona primero una mesa', 'info');
    MC.ir('mesas.html', 900);
    return;
  }
  MC.datos.buscar('comandas', function (c) { return c.mesa === mesa && ABIERTA(c); }).then(cargar);

  function guardarComanda() {
    var total = lineas.reduce(function (s, l) { return s + l.precio * l.cantidad; }, 0);
    var enviadas = lineas.map(function (l) { return Object.assign({}, l, { enviada: true }); });
    var op = comanda
      ? MC.datos.actualizar('comandas', comanda.folio, { lineas: enviadas, total: total, estado: 'Enviada' })
      : MC.datos.crear('comandas', { mesa: mesa, mesero: sesion ? sesion.nombre : '', fecha: MC.ahoraMx(), lineas: enviadas, total: total, estado: 'Enviada', cancelaciones: [] });
    return op.then(function (c) {
      return MC.datos.actualizar('mesas', mesa, { estado: 'Ocupada', comanda: c.folio }).then(function () { return c; });
    });
  }

  MC.tomarBoton($('btn-confirmar-comanda'), function () {
    if (!lineas.length) return MC.toast('Agrega al menos un alimento', 'error');
    if (pendiente || !comanda) {
      return guardarComanda().then(function (c) {
        pendiente = false;
        cargar(c);
        MC.toast('Comanda ' + c.folio + ' enviada a cocina', 'success');
      });
    }
    MC.confirmar('Cobrar comanda', 'La comanda ' + comanda.folio + ' de la mesa ' + mesa + ' suma ' + MC.dinero(comanda.total) + '. ¿Deseas cobrarla?', 'Cobrar').then(function (si) {
      if (!si) return;
      MC.temporal.guardar('cobro', { origen: 'comanda', comanda: comanda.folio, total: comanda.total, siguiente: '../comandas/mesas.html', regreso: '../comandas/comanda-crear.html?mesa=' + encodeURIComponent(mesa) });
      MC.ir('../ventas/cobro-efectivo.html');
    });
  });

  MC.tomarBoton(document.querySelector('.comanda-pie [data-ir="cancelar-comanda.html"]'), function () {
    if (!comanda) {
      if (!lineas.length) return MC.ir('mesas.html');
      return MC.confirmar('Descartar comanda', 'La comanda aún no se ha enviado a cocina. ¿Deseas descartarla?', 'Descartar').then(function (si) {
        if (si) MC.ir('mesas.html');
      });
    }
    if (pendiente) return MC.toast('Envía o quita primero los alimentos nuevos', 'info');
    MC.ir('cancelar-comanda.html?folio=' + encodeURIComponent(comanda.folio));
  });
})();
