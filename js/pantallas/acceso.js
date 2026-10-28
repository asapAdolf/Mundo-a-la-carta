/**
 * acceso.js - Login de clientes (acceso-login.html), del personal (acceso-personal.html)
 * y registro de clientes (acceso-registro.html).
 * Requiere datos.js y comun.js.
 *
 * Cuentas de ejemplo: admin / admin123 (Administrador), gerente / gerente123,
 * mesero / mesero123, ventas / ventas123 y clientes con su correo o usuario / cliente123.
 */
(function () {
  'use strict';
  var MC = window.MC;

  /* Destino después de iniciar sesión: la página que se intentó abrir; si no, el panel
   * administrativo para el personal o el inicio para los clientes */
  function destino(sesion) {
    var volver = MC.param('volver');
    if (volver && volver.charAt(0) === '/' && volver.charAt(1) !== '/') return volver;
    return MC.ruta(sesion.tipo === 'empleado' ? 'vistas/admin/dashboard.html' : 'index.html');
  }

  document.querySelectorAll('form[data-validar]').forEach(function (form) {
    var registro = !!form.querySelector('#tipo-de-cliente');

    /* En el formulario de login, permitir tanto correo como nombre de usuario cambiando el tipo a text
     * para que la validación genérica de formato email de comun.js no bloquee a usuarios sin '@' */
    var campoCorreo = form.querySelector('#correo-electronico');
    if (!registro && campoCorreo) {
      campoCorreo.type = 'text';
      campoCorreo.setAttribute('autocomplete', 'username');
      var label = form.querySelector('label[for="correo-electronico"]');
      if (label) label.innerHTML = 'Correo electrónico o usuario <span class="req">*</span>';
      var ayuda = campoCorreo.parentElement ? campoCorreo.parentElement.querySelector('.ayuda') : null;
      if (ayuda) ayuda.textContent = 'Correo o usuario · máx. 150 caracteres';
    }

    form.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var d = e.detail.datos;

      if (!registro) {
        var usuario = String(d.usuario || d['correo-electronico'] || '').trim();
        var inputId = form.querySelector('#correo-electronico') || form.querySelector('#usuario');

        /* Validación: si incluye '@' debe tener formato de correo válido;
         * si no tiene '@', se valida como nombre de usuario (mínimo 3 caracteres) */
        var esCorreo = usuario.indexOf('@') !== -1;
        if (esCorreo) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario)) {
            if (inputId) {
              inputId.setAttribute('aria-invalid', 'true');
              inputId.focus();
            }
            return MC.toast('Escribe un correo electrónico válido', 'error');
          }
        } else if (usuario.length < 3) {
          if (inputId) {
            inputId.setAttribute('aria-invalid', 'true');
            inputId.focus();
          }
          return MC.toast('El usuario debe tener al menos 3 caracteres', 'error');
        }

        /* Si es un usuario de cliente (sin @), permitir resolver su correo para iniciar sesión */
        var resolverCliente = !esCorreo
          ? MC.datos.buscar('usuarios', function (u) {
              var userCli = (u.usuario || String(u['correo-electronico'] || '').split('@')[0]).toLowerCase();
              return userCli === usuario.toLowerCase();
            })
          : Promise.resolve(null);

        resolverCliente.then(function (cli) {
          var idFinal = (cli && cli['correo-electronico']) ? cli['correo-electronico'] : usuario;
          return MC.sesion.iniciar(idFinal, d.password);
        }).then(function (s) {
          MC.toast('Bienvenido, ' + s.nombre, 'success');
          MC.ir(destino(s), 700);
        }).catch(function (err) {
          form.querySelector('#password').setAttribute('aria-invalid', 'true');
          MC.toast(err.message, 'error');
        });
        return;
      }

      /* Registro: el correo debe ser único y las contraseñas coincidir */
      if (d.password.length < 6) return MC.toast('La contraseña debe tener al menos 6 caracteres', 'error');
      if (d.password !== d['confirmar-password']) {
        form.querySelector('#confirmar-password').setAttribute('aria-invalid', 'true');
        return MC.toast('Las contraseñas no coinciden', 'error');
      }
      var correo = d['correo-electronico'].toLowerCase();
      MC.datos.buscar('usuarios', function (u) { return String(u['correo-electronico']).toLowerCase() === correo; }).then(function (existe) {
        if (existe) {
          form.querySelector('#correo-electronico').setAttribute('aria-invalid', 'true');
          return MC.toast('Ya existe una cuenta con ese correo', 'error');
        }
        delete d['confirmar-password'];
        d.estado = 'Activo';
        if (!d.usuario) d.usuario = correo.split('@')[0];
        return MC.datos.crear('usuarios', d).then(function () {
          MC.toast('Cuenta creada correctamente. Ya puedes iniciar sesión', 'success');
          MC.ir(form.getAttribute('data-ir'), 900);
        });
      });
    });
  });
})();
