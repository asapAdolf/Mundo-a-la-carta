/**
 * devolucion.js - Autorizar / rechazar devolución de ventas (CU_14_01_01).
 * El rechazo exige observaciones. Requiere comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var obs = document.getElementById('observaciones-dictamen');
  var rechazar = document.getElementById('btn-rechazar');
  if (!obs || !rechazar) return;

  rechazar.addEventListener('click', function () {
    if (!obs.value.trim()) {
      obs.setAttribute('aria-invalid', 'true');
      obs.focus();
      return MC.toast('Las observaciones son obligatorias al rechazar', 'error');
    }
    MC.toast('Devolución rechazada', 'info');
    MC.ir(rechazar.getAttribute('data-destino'), 800);
  });
})();
