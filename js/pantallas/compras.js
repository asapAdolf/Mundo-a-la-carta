/**
 * compras.js - Registrar compra: filas de artículos y total. Requiere comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var cuerpo = document.getElementById('lineas-compra');
  var total = document.getElementById('total-compra');
  if (!cuerpo) return;

  function recalcular() {
    var suma = 0;
    cuerpo.querySelectorAll('tr').forEach(function (tr) {
      var sel = tr.querySelector('select.articulo');
      var op = sel.options[sel.selectedIndex];
      var precio = Number(op.getAttribute('data-precio') || 0);
      var cant = parseInt(tr.querySelector('.cantidad').value, 10) || 0;
      tr.querySelector('.estado').textContent = op.getAttribute('data-estado') || 'Vigente / n.a.';
      tr.querySelector('.precio').textContent = precio.toFixed(2);
      var sub = precio * cant;
      tr.querySelector('.sub').textContent = sub.toFixed(2);
      suma += sub;
    });
    total.textContent = MC.dinero(suma);
  }

  document.getElementById('agregar-linea').addEventListener('click', function () {
    var molde = cuerpo.querySelector('tr');
    var nueva = molde.cloneNode(true);
    nueva.querySelector('select.articulo').selectedIndex = 0;
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
  cuerpo.addEventListener('input', recalcular);
  cuerpo.addEventListener('change', recalcular);
  recalcular();
})();
