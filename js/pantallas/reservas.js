/**
 * reservas.js - Reservaciones: selección de sala y cálculo de hora de salida.
 * Requiere comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;

  /* Selección de sala (disponibilidad) */
  var salas = document.querySelectorAll('.sala:not(:disabled)');
  var etiqueta = document.getElementById('sala-elegida');
  var confirmar = document.getElementById('btn-confirmar-sala');
  salas.forEach(function (s) {
    s.addEventListener('click', function () {
      document.querySelectorAll('.sala').forEach(function (x) { x.classList.remove('seleccionada'); });
      s.classList.add('seleccionada');
      if (etiqueta) etiqueta.value = s.dataset.nombre;
      if (confirmar) confirmar.disabled = false;
    });
  });

  /* Hora de salida automática: entrada + 3 h */
  var entrada = document.getElementById('hora-entrada');
  var salida = document.getElementById('hora-salida');
  if (entrada && salida) {
    entrada.addEventListener('input', function () {
      if (!entrada.value) { salida.value = ''; return; }
      var p = entrada.value.split(':');
      var h = (parseInt(p[0], 10) + 3) % 24;
      salida.value = String(h).padStart(2, '0') + ':' + p[1];
    });
  }

  /* Confirmar resumen solo si el cliente acepta */
  var acepto = document.getElementById('acepto');
  var btnResumen = document.getElementById('btn-confirmar-resumen');
  if (acepto && btnResumen) {
    btnResumen.disabled = true;
    acepto.addEventListener('change', function () { btnResumen.disabled = !acepto.checked; });
  }

  /* Cálculo de multa por cancelación (15 %) y devolución */
  var monto = document.getElementById('monto-reserva');
  var multa = document.getElementById('multa');
  if (monto && multa) multa.value = (parseFloat(monto.value) * 0.15).toFixed(2);
  var devolver = document.getElementById('monto-devolver');
  if (monto && devolver) devolver.value = parseFloat(monto.value).toFixed(2);
  void MC;
})();
