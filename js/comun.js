/**
 * comun.js - Comportamientos compartidos por todas las pantallas (vistas/*.html)
 * Se controla por atributos data-* para no repetir scripts en cada pantalla:
 *   data-ir="url"            navega al hacer clic (con data-toast opcional antes de navegar)
 *   data-toast="mensaje"     muestra un toast (data-toast-tipo: success | error | info)
 *   data-modal-abrir="id"    abre un .modal-backdrop
 *   data-modal-cerrar        cierra el modal contenedor
 *   form[data-validar]       valida campos [required]; data-exito="msg", data-ir="url"
 *   [data-paso="1|-1"]       botones de un [data-stepper] (input numérico)
 *   [data-previsualizar]     input file que pinta la imagen elegida en su .avatar
 */
(function () {
  'use strict';

  var MC = (window.MC = window.MC || {});

  /* ---------- Utilidades ---------- */
  MC.dinero = function (n) {
    return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  MC.toast = function (mensaje, tipo) {
    tipo = tipo || 'info';
    var cont = document.getElementById('toast-container');
    if (!cont) return;
    var iconos = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + tipo;
    el.setAttribute('role', 'status');
    el.innerHTML = '<i class="fa-solid ' + (iconos[tipo] || iconos.info) + '"></i><span></span>';
    el.querySelector('span').textContent = mensaje;
    cont.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  };

  MC.ir = function (url, retraso) {
    if (!url) return;
    setTimeout(function () {
      if (url === 'back') window.history.back(); else window.location.href = url;
    }, retraso || 0);
  };

  /* ---------- Clics por atributos ---------- */
  document.addEventListener('click', function (e) {
    var abrir = e.target.closest('[data-modal-abrir]');
    if (abrir) {
      var modal = document.getElementById(abrir.getAttribute('data-modal-abrir'));
      if (modal) modal.classList.add('open');
      return;
    }
    var cerrar = e.target.closest('[data-modal-cerrar]');
    if (cerrar) {
      var m = cerrar.closest('.modal-backdrop');
      if (m) m.classList.remove('open');
      if (!cerrar.hasAttribute('data-ir') && !cerrar.hasAttribute('data-toast')) return;
    }
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
      return;
    }

    var accion = e.target.closest('[data-ir], [data-toast]');
    if (accion && accion.type !== 'submit') {
      var msg = accion.getAttribute('data-toast');
      var url = accion.getAttribute('data-ir');
      if (msg) MC.toast(msg, accion.getAttribute('data-toast-tipo') || 'info');
      if (accion.tagName === 'A') e.preventDefault();
      if (url) MC.ir(url, msg ? 700 : 0);
    }

    /* Menús desplegables del encabezado */
    var alterna = e.target.closest('[data-alternar]');
    if (alterna) {
      var panel = document.getElementById(alterna.getAttribute('data-alternar'));
      document.querySelectorAll('.buscador, .menu-hamburguesa').forEach(function (p) {
        if (p !== panel) p.classList.remove('abierto');
      });
      if (panel) {
        panel.classList.toggle('abierto');
        var foco = panel.querySelector('input');
        if (foco && panel.classList.contains('abierto')) foco.focus();
      }
    } else if (!e.target.closest('.buscador, .menu-hamburguesa')) {
      document.querySelectorAll('.buscador, .menu-hamburguesa').forEach(function (p) { p.classList.remove('abierto'); });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-backdrop.open').forEach(function (m) { m.classList.remove('open'); });
    document.querySelectorAll('.buscador, .menu-hamburguesa').forEach(function (p) { p.classList.remove('abierto'); });
  });

  /* ---------- Buscador del encabezado ---------- */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('.buscador form')) {
      e.preventDefault();
      var q = (f.querySelector('input').value || '').trim().toLowerCase();
      if (!q) return MC.toast('Escribe qué deseas buscar', 'info');
      var hit = (window.MC_PANTALLAS || []).find(function (p) { return p.titulo.toLowerCase().indexOf(q) !== -1; });
      if (hit) {
        var raiz = document.body.getAttribute('data-raiz') || '.';
        MC.ir((raiz === '.' ? '' : raiz + '/') + hit.ruta);
      } else {
        MC.toast('Sin resultados para "' + q + '"', 'error');
      }
    }
  });

  /* ---------- Validación de formularios ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('form[data-validar]')) return;
    e.preventDefault();

    var invalidos = [];
    form.querySelectorAll('[required]').forEach(function (campo) {
      var vacio = campo.type === 'checkbox' ? !campo.checked : !String(campo.value).trim();
      if (campo.disabled || campo.readOnly) vacio = false;
      if (vacio) { campo.setAttribute('aria-invalid', 'true'); invalidos.push(campo); }
      else campo.removeAttribute('aria-invalid');
    });

    if (invalidos.length) {
      invalidos[0].focus();
      return MC.toast('Completa los campos obligatorios (*)', 'error');
    }
    MC.toast(form.getAttribute('data-exito') || 'Operación realizada con éxito', 'success');
    MC.ir(form.getAttribute('data-ir'), 800);
  });

  document.addEventListener('input', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('aria-invalid') && String(e.target.value).trim()) {
      e.target.removeAttribute('aria-invalid');
    }
  });

  /* ---------- Steppers numéricos ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-paso]');
    if (!btn) return;
    var cont = btn.closest('[data-stepper]');
    var input = cont && cont.querySelector('input');
    if (!input) return;
    var min = Number(cont.getAttribute('data-min') || 0);
    var max = Number(cont.getAttribute('data-max') || 99);
    var val = Math.min(max, Math.max(min, (parseInt(input.value, 10) || 0) + Number(btn.getAttribute('data-paso'))));
    input.value = val;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  /* ---------- Previsualización de fotos ---------- */
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input.matches('input[type=file][data-previsualizar]') || !input.files[0]) return;
    var avatar = input.closest('label').querySelector('.avatar');
    var url = URL.createObjectURL(input.files[0]);
    avatar.innerHTML = '<img alt="Vista previa" src="' + url + '">';
  });
})();
