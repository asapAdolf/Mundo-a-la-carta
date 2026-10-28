/**
 * compras.js - Registrar compra (CU_11): filas de artículos, total y alta de la orden.
 * Los souvenirs se toman del catálogo (solo vigentes) y su existencia aumenta al registrar.
 * Requiere datos.js y comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var cuerpo = document.getElementById('lineas-compra');
  var total = document.getElementById('total-compra');
  if (!cuerpo) return;
  var form = cuerpo.closest('form');

  /* Ingredientes del prototipo (los souvenirs vienen de la base de datos) */
  var INGREDIENTES = Array.prototype.filter.call(cuerpo.querySelectorAll('select.articulo option'), function (o) {
    return o.getAttribute('data-estado') === 'n.a.';
  }).map(function (o) { return { nombre: o.textContent, precio: o.getAttribute('data-precio'), estado: 'n.a.' }; });
  var SOUVENIRS = [];

  function opciones(tipo) {
    var lista = tipo === 'Ingrediente' ? INGREDIENTES : SOUVENIRS;
    return '<option value="" data-precio="0" data-estado="—">Selecciona...</option>' + lista.map(function (a) {
      return '<option value="' + MC.esc(a.folio || a.nombre) + '" data-precio="' + MC.esc(a.precio) + '" data-estado="' + MC.esc(a.estado) + '">' + MC.esc(a.nombre) + '</option>';
    }).join('');
  }
  function prepararFila(tr) {
    var tipo = tr.querySelector('select:not(.articulo)');
    tr.querySelector('select.articulo').innerHTML = opciones(tipo.value);
  }

  function recalcular() {
    var suma = 0;
    cuerpo.querySelectorAll('tr').forEach(function (tr) {
      var sel = tr.querySelector('select.articulo');
      var op = sel.options[sel.selectedIndex];
      var precio = Number(op ? op.getAttribute('data-precio') : 0) || 0;
      var cant = parseInt(tr.querySelector('.cantidad').value, 10) || 0;
      tr.querySelector('.estado').textContent = op && sel.value ? op.getAttribute('data-estado') : '—';
      tr.querySelector('.precio').textContent = precio.toFixed(2);
      var sub = precio * cant;
      tr.querySelector('.sub').textContent = sub.toFixed(2);
      suma += sub;
    });
    total.textContent = MC.dinero(suma);
    return suma;
  }

  MC.datos.listar('souvenirs', { filtro: { estado: 'Activo' } }).then(function (res) {
    SOUVENIRS = res.items.map(function (s) { return { folio: s.folio, nombre: s.nombre, precio: s['precio-por-unidad'], estado: 'Vigente' }; });
    cuerpo.querySelectorAll('tr').forEach(prepararFila);
    recalcular();
  });

  var registro = document.getElementById('registro');
  if (registro) registro.value = MC.ahoraMx();
  MC.datos.siguienteFolio('compras').then(function (f) {
    var folio = document.getElementById('folio-orden');
    if (folio) { folio.removeAttribute('pattern'); folio.value = f; }
  });

  document.getElementById('agregar-linea').addEventListener('click', function () {
    var nueva = cuerpo.querySelector('tr').cloneNode(true);
    nueva.querySelector('select:not(.articulo)').selectedIndex = 0;
    prepararFila(nueva);
    nueva.querySelector('.cantidad').value = 0;
    cuerpo.appendChild(nueva);
    recalcular();
  });

  cuerpo.addEventListener('click', function (e) {
    if (!e.target.closest('.quitar')) return;
    if (cuerpo.querySelectorAll('tr').length === 1) return MC.toast('La orden necesita al menos un artículo', 'error');
    e.target.closest('tr').remove();
    recalcular();
  });
  cuerpo.addEventListener('change', function (e) {
    if (e.target.matches('select:not(.articulo)')) prepararFila(e.target.closest('tr'));
    recalcular();
  });
  cuerpo.addEventListener('input', recalcular);
  recalcular();

  form.addEventListener('mc:enviar', function (e) {
    e.preventDefault();
    var d = e.detail.datos;
    var lineas = [];
    var error = null;
    cuerpo.querySelectorAll('tr').forEach(function (tr) {
      var sel = tr.querySelector('select.articulo');
      var cant = parseInt(tr.querySelector('.cantidad').value, 10) || 0;
      if (!sel.value && !cant) return;
      if (!sel.value) error = 'Selecciona el artículo de cada fila';
      else if (cant < 1) error = 'La cantidad de ' + sel.options[sel.selectedIndex].text + ' debe ser mayor a 0';
      var op = sel.options[sel.selectedIndex];
      lineas.push({ tipo: tr.querySelector('select:not(.articulo)').value, articulo: op.text, folio: sel.value, cantidad: cant, precio: Number(op.getAttribute('data-precio')) });
    });
    if (error) return MC.toast(error, 'error');
    if (!lineas.length) return MC.toast('Agrega al menos un artículo con cantidad', 'error');
    if (d['fecha-de-compra'] > MC.hoy()) return MC.toast('La fecha de compra no puede ser futura', 'error');

    var compra = {
      proveedor: d.proveedor, fecha: d['fecha-de-compra'], registro: MC.ahoraMx(), estado: 'Emitida',
      observaciones: d.observaciones, lineas: lineas, total: recalcular(), registro_por: (MC.sesion.actual() || {}).nombre
    };
    MC.datos.crear('compras', compra).then(function (c) {
      /* Ingreso al inventario de los souvenirs comprados */
      return Promise.all(lineas.filter(function (l) { return l.tipo === 'Souvenir'; }).map(function (l) {
        return MC.datos.obtener('souvenirs', l.folio).then(function (s) {
          return MC.datos.actualizar('souvenirs', s.folio, { existencia: (Number(s.existencia) || 0) + l.cantidad });
        });
      })).then(function () { return c; });
    }).then(function (c) {
      MC.toast('Compra registrada con folio ' + c.folio + ' por ' + MC.dinero(c.total), 'success');
      MC.ir('registrar-compra.html', 1600);
    }).catch(function (err) { MC.toast(err.message, 'error'); });
  });
})();
