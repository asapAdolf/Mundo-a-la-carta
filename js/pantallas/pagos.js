/**
 * pagos.js - Pantallas de pago: selección de método, cálculo de cambio,
 * venta de souvenirs y formato de tarjeta. Requiere comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var num = function (v) { return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0; };

  /* Método de pago seleccionable (checkout) */
  document.querySelectorAll('.metodo[data-metodo]').forEach(function (m) {
    m.addEventListener('click', function () {
      document.querySelectorAll('.metodo').forEach(function (x) { x.classList.remove('seleccionado'); });
      m.classList.add('seleccionado');
      var destino = document.getElementById('btn-metodo');
      if (destino) destino.textContent = m.getAttribute('data-metodo');
    });
  });

  /* Cambio = recibido - total (efectivo) */
  var recibido = document.getElementById('monto-recibido');
  var cambio = document.getElementById('cambio');
  var indicador = document.getElementById('indicador-cambio');
  var confirmar = document.getElementById('btn-confirmar-pago');

  function totalAPagar() {
    var s = document.getElementById('subtotal');
    if (s) return num(s.value) || 0;
    var t = document.getElementById('total-pagar');
    return t ? num(t.value) : 0;
  }

  function recalcular() {
    if (!recibido || !cambio) return;
    var total = totalAPagar();
    var dif = num(recibido.value) - total;
    cambio.value = dif > 0 ? dif.toFixed(2) : '0.00';
    if (indicador) {
      var ok = total > 0 && dif >= 0;
      indicador.className = 'indicador ' + (total === 0 ? '' : ok ? 'indicador--ok' : 'indicador--falta');
      indicador.querySelector('span').textContent = total === 0 ? 'Captura el total a cobrar' : ok ? 'Pago completo' : 'Faltan ' + MC.dinero(-dif);
    }
    if (confirmar && confirmar.hasAttribute('data-requiere-pago')) confirmar.disabled = !(total > 0 && dif >= 0);
  }

  /* Venta de souvenirs: precio * cantidad */
  var sel = document.getElementById('souvenir');
  var cant = document.getElementById('cantidad');
  var precio = document.getElementById('precio-unitario');
  var subtotal = document.getElementById('subtotal');
  function recalcularVenta() {
    if (!sel || !subtotal) return;
    var p = num(sel.options[sel.selectedIndex].getAttribute('data-precio'));
    precio.value = p.toFixed(2);
    subtotal.value = (p * (parseInt(cant.value, 10) || 0)).toFixed(2);
    recalcular();
  }
  if (sel) { sel.addEventListener('change', recalcularVenta); cant.addEventListener('input', recalcularVenta); }
  if (recibido) recibido.addEventListener('input', recalcular);
  if (recibido && !sel) {
    var t = document.getElementById('total-pagar');
    if (t) t.addEventListener('input', recalcular);
  }

  /* Formato de tarjeta */
  var numTarjeta = document.getElementById('numero-tarjeta');
  if (numTarjeta) numTarjeta.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  });
  var venc = document.getElementById('vencimiento');
  if (venc) venc.addEventListener('input', function () {
    var d = this.value.replace(/\D/g, '').slice(0, 4);
    this.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
  var cvv = document.getElementById('cvv');
  if (cvv) cvv.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });

  recalcularVenta();
  recalcular();
})();
