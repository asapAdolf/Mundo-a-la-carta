/**
 * dashboard.js - Panel administrativo base: indicadores, próximas reservaciones
 * (listado paginado) y alertas de inventario / flotilla. Requiere datos.js y comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var $ = function (id) { return document.getElementById(id); };
  var hoy = MC.hoy();
  var enSemana = MC.hoy(7);

  Promise.all([
    MC.datos.listar('reservaciones', { filtro: function (r) { return r.estado === 'Activa' && r.fecha >= hoy && r.fecha <= enSemana; } }),
    MC.datos.listar('ventas', { filtro: function (v) { return v.estado === 'Pagado' && String(v.fecha).slice(0, 10) === hoy; } }),
    MC.datos.listar('mesas'),
    MC.datos.listar('souvenirs', { filtro: function (s) { return s.estado === 'Activo' && Number(s.existencia) <= 5; } }),
    MC.datos.listar('transporte', { filtro: { estado: 'En mantenimiento' } })
  ]).then(function (r) {
    $('kpi-reservas').textContent = r[0].total;
    $('kpi-ventas').textContent = MC.dinero(r[1].items.reduce(function (s, v) { return s + Number(v.total); }, 0));
    $('kpi-mesas').textContent = r[2].items.filter(function (m) { return m.estado === 'Ocupada'; }).length + ' / ' + r[2].total;

    var alertas = r[3].items.map(function (s) {
      return '<li><i class="fa-solid fa-box-open"></i><span><a href="../souvenirs/souvenir-consulta.html?folio=' + encodeURIComponent(s.folio) + '">' + MC.esc(s.nombre) + '</a>: quedan ' + s.existencia + ' piezas</span></li>';
    }).concat(r[4].items.map(function (t) {
      return '<li><i class="fa-solid fa-screwdriver-wrench"></i><span><a href="../transporte/transporte-consulta.html?folio=' + encodeURIComponent(t.folio) + '">' + MC.esc(t.marca + ' ' + t.modelo) + '</a> en mantenimiento</span></li>';
    }));
    $('kpi-alertas').textContent = alertas.length;
    $('lista-alertas').innerHTML = alertas.length ? alertas.join('') : '<li>Sin alertas pendientes</li>';
  });

  MC.listado({
    antesDe: $('ancla-proximas'), coleccion: 'reservaciones', porPagina: 5,
    placeholder: 'Buscar por folio, cliente o sala...', buscarEn: ['folio', 'cliente', 'sala', 'tipo-evento'],
    filtro: function (r) { return r.estado === 'Activa' && r.fecha >= hoy; },
    orden: function (a, b) { return (a.fecha + a['hora-entrada']).localeCompare(b.fecha + b['hora-entrada']); },
    columnas: [
      { titulo: 'Folio', campo: 'folio' },
      { titulo: 'Fecha', render: function (r) { return MC.fechaMx(r.fecha) + ' ' + MC.esc(r['hora-entrada']); } },
      { titulo: 'Cliente', campo: 'cliente' },
      { titulo: 'Sala', campo: 'sala' },
      { titulo: 'Personas', campo: 'comensales' }
    ],
    acciones: function (r) {
      return '<a href="../reservas/reservacion-consultar.html?folio=' + encodeURIComponent(r.folio) + '" title="Consultar"><i class="fa-solid fa-eye"></i></a>' +
        '<a href="../reservas/reservacion-modificar.html?folio=' + encodeURIComponent(r.folio) + '" title="Modificar"><i class="fa-solid fa-pen-to-square"></i></a>';
    },
    alSeleccionar: function (r) { MC.ir('../reservas/reservacion-consultar.html?folio=' + encodeURIComponent(r.folio)); }
  });
})();
