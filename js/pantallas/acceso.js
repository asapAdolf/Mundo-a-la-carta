/**
 * acceso.js - Login de clientes (acceso-login.html), del personal (acceso-personal.html)
 * y registro de clientes (acceso-registro.html).
 * Requiere datos.js y comun.js.
 *
 * Cuentas de ejemplo: admin / admin123 (Administrador), gerente / gerente123,
 * mesero / mesero123, ventas / ventas123 y clientes con su correo / cliente123.
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

    form.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var d = e.detail.datos;

      if (!registro) {
        var usuario = d.usuario || d['correo-electronico'];
        MC.sesion.iniciar(usuario, d.password).then(function (s) {
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
        return MC.datos.crear('usuarios', d).then(function () {
          MC.toast('Cuenta creada correctamente. Ya puedes iniciar sesión', 'success');
          MC.ir(form.getAttribute('data-ir'), 900);
        });
      });
    });
  });
})();
