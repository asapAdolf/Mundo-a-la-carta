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

  /* Comanda (y línea opcional) que se va a cancelar: ?folio=0001024&linea=0 */
  var comanda = null;
  var indiceLinea = MC.param('linea');
  var maximo = 99;
  MC.datos.obtener('comandas', MC.param('folio')).then(function (c) {
    if (c.estado !== 'Enviada' && c.estado !== 'Abierta') throw new Error('La comanda ' + c.folio + ' ya está ' + c.estado.toLowerCase());
    comanda = c;
    var linea = indiceLinea !== null ? c.lineas[Number(indiceLinea)] : null;
    maximo = linea ? linea.cantidad : c.lineas.reduce(function (s, l) { return s + l.cantidad; }, 0);
    cantidad.value = maximo;
    actualizarStepper();
    MC.toast(linea ? 'Cancelar ' + linea.nombre + ' (máx. ' + maximo + ')' : 'Cancelar toda la comanda ' + c.folio + ' · mesa ' + c.mesa, 'info');
  }).catch(function (err) {
    MC.toast(err.message || 'Abre la cancelación desde una comanda', 'error');
    MC.ir('mesas.html', 1500);
  });

  if (btnCancelar) {
    btnCancelar.addEventListener('click', function () {
      MC.toast('Cancelación descartada. Regresando a comanda...', 'info');
      MC.ir(comanda ? 'comanda-crear.html?mesa=' + encodeURIComponent(comanda.mesa) : 'mesas.html', 600);
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

    if (ok && cantVal > maximo) {
      mostrarError('error-cantidad', cantidad, 'La cantidad no puede ser mayor a ' + maximo + '.');
      ok = false;
    }

    if (!ok) {
      MC.toast('Revisa los campos marcados en rojo', 'error');
      return;
    }
    if (!comanda) return MC.toast('No hay una comanda que cancelar', 'error');

    /* Autoriza un gerente o administrador activo */
    MC.datos.buscar('empleados', function (e) {
      return e.estado === 'Activo' && (e['rol-puesto'] === 'Gerente' || e['rol-puesto'] === 'Administrador') && e.password === password.value;
    }).then(function (gerente) {
      if (!gerente) {
        mostrarError('error-password', password, 'Contraseña de gerente incorrecta.');
        throw new Error('Contraseña de gerente incorrecta');
      }
      var lineas = comanda.lineas.slice();
      var alimentos;
      if (indiceLinea !== null) {
        var l = lineas[Number(indiceLinea)];
        alimentos = l.nombre;
        l.cantidad -= cantVal;
        if (l.cantidad <= 0) lineas.splice(Number(indiceLinea), 1);
      } else {
        alimentos = cantVal >= maximo ? 'Toda la comanda' : 'Varios';
        var restantes = cantVal;
        for (var i = lineas.length - 1; i >= 0 && restantes > 0; i--) {
          var quitar = Math.min(lineas[i].cantidad, restantes);
          lineas[i].cantidad -= quitar;
          restantes -= quitar;
          if (lineas[i].cantidad <= 0) lineas.splice(i, 1);
        }
      }
      var todo = !lineas.length;
      var registro = { fecha: MC.ahoraMx(), motivo: motivo.value.trim(), alimentos: alimentos, cantidad: cantVal, autorizo: gerente.nombre };
      return MC.datos.actualizar('comandas', comanda.folio, {
        lineas: lineas,
        total: lineas.reduce(function (s, x) { return s + x.precio * x.cantidad; }, 0),
        estado: todo ? 'Cancelada' : comanda.estado,
        cancelaciones: (comanda.cancelaciones || []).concat([registro])
      }).then(function () {
        return todo ? MC.datos.actualizar('mesas', comanda.mesa, { estado: 'Libre', comanda: null }) : null;
      }).then(function () {
        MC.temporal.guardar('cancelacion', {
          folio: comanda.folio, mesa: comanda.mesa, fecha: MC.fechaMx(MC.hoy()), motivo: registro.motivo,
          alimentos: alimentos, detalle: 'Autorizó: ' + gerente.nombre, cantidad: cantVal, total: todo
        });
        MC.toast('Comanda cancelada con autorización de gerente', 'success');
        MC.ir('comanda-cancelar-aviso.html?folio=' + encodeURIComponent(comanda.folio), 700);
      });
    }).catch(function (err) { MC.toast(err.message, 'error'); });
  });

  actualizarContador();
  actualizarStepper();
})();
