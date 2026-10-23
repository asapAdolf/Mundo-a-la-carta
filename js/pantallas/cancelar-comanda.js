/**
 * cancelar-comanda.js - Lógica del formulario PA_09_02_01 Cancelar comanda
 * Controla el contador de caracteres (0/500), el selector de cantidad (< >)
 * y la validación de motivo, cantidad y contraseña de gerente.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var form = document.getElementById('form-cancelar');
  if (!form) return;

  var motivo = document.getElementById('motivo');
  var contador = document.getElementById('contador-motivo');
  var cantidad = document.getElementById('cantidad');
  var btnMenos = document.getElementById('menos');
  var btnMas = document.getElementById('mas');
  var password = document.getElementById('password');
  var btnCancelar = document.getElementById('btn-cancelar');

  function actualizarContador() {
    if (contador && motivo) {
      contador.textContent = motivo.value.length + ' / 500';
    }
  }

  function actualizarStepper() {
    var val = Math.max(1, Math.min(99, parseInt(cantidad.value, 10) || 1));
    cantidad.value = val;
    if (btnMenos) btnMenos.disabled = val <= 1;
    if (btnMas) btnMas.disabled = val >= 99;
  }

  function mostrarError(idError, campo, msg) {
    var el = document.getElementById(idError);
    if (el) el.textContent = msg || '';
    if (campo) {
      if (msg) campo.setAttribute('aria-invalid', 'true');
      else campo.removeAttribute('aria-invalid');
    }
  }

  if (motivo) {
    motivo.addEventListener('input', function () {
      actualizarContador();
      if (motivo.value.trim()) mostrarError('error-motivo', motivo, '');
    });
  }

  if (cantidad) {
    cantidad.addEventListener('input', function () {
      cantidad.value = cantidad.value.replace(/\D/g, '').slice(0, 2);
      if (cantidad.value) mostrarError('error-cantidad', cantidad, '');
    });
    cantidad.addEventListener('blur', actualizarStepper);
  }

  if (btnMenos) {
    btnMenos.addEventListener('click', function () {
      cantidad.value = Math.max(1, (parseInt(cantidad.value, 10) || 1) - 1);
      actualizarStepper();
    });
  }

  if (btnMas) {
    btnMas.addEventListener('click', function () {
      cantidad.value = Math.min(99, (parseInt(cantidad.value, 10) || 1) + 1);
      actualizarStepper();
    });
  }

  if (password) {
    password.addEventListener('input', function () {
      if (password.value.trim()) mostrarError('error-password', password, '');
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', function () {
      MC.toast('Cancelación descartada. Regresando a comanda...', 'info');
      MC.ir('comanda-crear.html', 600);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;

    if (!motivo.value.trim()) {
      mostrarError('error-motivo', motivo, 'Ingresa el motivo de cancelación.');
      ok = false;
    } else {
      mostrarError('error-motivo', motivo, '');
    }

    var cantVal = parseInt(cantidad.value, 10);
    if (!cantVal || cantVal < 1 || cantVal > 99) {
      mostrarError('error-cantidad', cantidad, 'Ingresa una cantidad válida (1 a 99).');
      ok = false;
    } else {
      mostrarError('error-cantidad', cantidad, '');
    }

    if (!password.value.trim()) {
      mostrarError('error-password', password, 'Se requiere la contraseña de gerente.');
      ok = false;
    } else {
      mostrarError('error-password', password, '');
    }

    if (!ok) {
      MC.toast('Revisa los campos marcados en rojo', 'error');
      return;
    }

    MC.toast('Comanda cancelada con autorización de gerente', 'success');
    MC.ir('comanda-cancelar-aviso.html', 700);
  });

  actualizarContador();
  actualizarStepper();
})();
