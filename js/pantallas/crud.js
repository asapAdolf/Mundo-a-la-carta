/**
 * crud.js - Altas, modificaciones, bajas y consultas de usuarios, souvenirs,
 * roles / empleados y transporte. Requiere datos.js y comun.js.
 *
 * El módulo y la operación se deducen del nombre del archivo (usuario-crear.html,
 * transporte-baja.html, ...). En modificar, baja y consulta se muestra un listado
 * paginado; el registro elegido se identifica con ?folio= en la URL.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var archivo = (window.location.pathname.split('/').pop() || '').replace('.html', '');
  var partes = archivo.match(/^(usuario|souvenir|rol|transporte)-(crear|modificar|baja|consulta)$/);
  if (!partes) return;

  var dinero = function (r) { return MC.dinero(r['precio-por-unidad']); };
  var estado = function (r) { return MC.insigniaEstado(r.estado); };

  var MODULOS = {
    usuario: {
      coleccion: 'usuarios', nombre: 'Usuario', articulo: 'El usuario',
      columnas: [{ titulo: 'Folio', campo: 'folio' }, { titulo: 'Nombre', campo: 'nombre' }, { titulo: 'Correo', campo: 'correo-electronico' },
        { titulo: 'Teléfono', campo: 'telefono' }, { titulo: 'Tipo', campo: 'tipo-de-cliente' }, { titulo: 'Estado', render: estado }],
      buscarEn: ['folio', 'nombre', 'correo-electronico', 'telefono', 'tipo-de-cliente'],
      unicos: { 'correo-electronico': 'Ya existe un usuario con ese correo' },
      alCrear: function (d) { d.password = 'cliente123'; },
      avisoCrear: 'Contraseña temporal: cliente123'
    },
    souvenir: {
      coleccion: 'souvenirs', nombre: 'Souvenir', articulo: 'El souvenir',
      columnas: [{ titulo: 'Folio', campo: 'folio' }, { titulo: 'Nombre', campo: 'nombre' }, { titulo: 'Precio', render: dinero },
        { titulo: 'Departamento', campo: 'departamento' }, { titulo: 'Proveedor', campo: 'clave-del-proveedor' }, { titulo: 'Estado', render: estado }],
      buscarEn: ['folio', 'nombre', 'departamento', 'clave-del-proveedor'],
      unicos: { nombre: 'Ya existe un souvenir con ese nombre' },
      alCrear: function (d) { d.existencia = 0; }
    },
    rol: {
      coleccion: 'empleados', nombre: 'Empleado', articulo: 'El empleado',
      columnas: [{ titulo: 'Folio', campo: 'folio' }, { titulo: 'Nombre', campo: 'nombre' }, { titulo: 'Área', campo: 'area' },
        { titulo: 'Rol / puesto', campo: 'rol-puesto' }, { titulo: 'Contrato', campo: 'clave-del-contrato' }, { titulo: 'Estado', render: estado }],
      buscarEn: ['folio', 'nombre', 'area', 'rol-puesto', 'correo', 'clave-del-contrato'],
      unicos: { 'clave-del-contrato': 'La clave del contrato ya está asignada a otro empleado', correo: 'Ese correo ya pertenece a otro empleado' }, // RN_30
      alCrear: function (d) {
        d.usuario = (d.correo ? d.correo.split('@')[0] : d.nombre.split(' ')[0]).toLowerCase();
        d.password = 'empleado123';
      },
      avisoCrear: 'Usuario de acceso: correo o nombre · contraseña temporal: empleado123'
    },
    transporte: {
      coleccion: 'transporte', nombre: 'Unidad', articulo: 'La unidad de transporte',
      columnas: [{ titulo: 'Folio', campo: 'folio' }, { titulo: 'VIN', campo: 'vin' }, { titulo: 'Unidad', render: function (r) { return MC.esc(r.marca + ' ' + r.modelo); } },
        { titulo: 'Placas', campo: 'placas' }, { titulo: 'Capacidad', campo: 'capacidad' }, { titulo: 'Estado', render: estado }],
      buscarEn: ['folio', 'vin', 'marca', 'modelo', 'placas', 'tipo-de-vehiculo'],
      unicos: { vin: 'Ya existe una unidad con ese número de serie (VIN)', placas: 'Ya existe una unidad con esas placas' },
      estados: { activo: 'Disponible', temporal: 'En mantenimiento', definitiva: 'Retirado' }, // RN_185, RN_207, RN_208
      motivos: { temporal: 'motivo-baja-temporal', definitiva: 'motivo-baja-definitiva' }, // RN_197
      noEditables: ['vin'], // RN_193 / RN_205
      confirmarCambios: true, // RN_194
      validar: function (d) {
        if (d.vin !== undefined && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(d.vin)) return ['vin', 'El VIN debe tener 17 caracteres alfanuméricos (sin I, O ni Q)']; // RN_189
        if (!/^\d+$/.test(d.capacidad) || Number(d.capacidad) < 1) return ['capacidad', 'La capacidad debe ser un número entero mayor a 0']; // RN_190
        var hoy = MC.hoy();
        if (d['vigencia-de-poliza'] < hoy) return ['vigencia-de-poliza', 'La póliza de seguro está vencida']; // RN_201
        if (d['vigencia-de-tarjeta-de-circulacion'] < hoy) return ['vigencia-de-tarjeta-de-circulacion', 'La tarjeta de circulación está vencida'];
        return null;
      }
    }
  };

  var cfg = MODULOS[partes[1]];
  var modo = partes[2];
  var ESTADOS = cfg.estados || { activo: 'Activo', temporal: 'Inactivo', definitiva: 'Baja' };
  var pagina = function (m) { return partes[1] + '-' + m + '.html'; };

  var form = document.querySelector('.principal form.tarjeta-pantalla');
  if (!form) return;
  var foliosCab = Array.prototype.slice.call(form.querySelectorAll('.form-cabecera .folio'));
  var folioEl = foliosCab.filter(function (f) { return /folio/i.test(f.textContent); }).map(function (f) { return f.querySelector('strong'); })[0];
  var estadoEl = foliosCab.filter(function (f) { return /^\s*estado/i.test(f.textContent); }).map(function (f) { return f.querySelector('strong'); })[0];
  var avatar = form.querySelector('.subir-foto .avatar');
  var iconoAvatar = avatar ? avatar.innerHTML : '';
  var fotoNueva = null;
  var actual = null;
  var cambiosPendientes = false;

  function marcarInvalido(id, msg) {
    var c = form.querySelector('#' + id);
    if (c) { c.setAttribute('aria-invalid', 'true'); c.focus(); }
    MC.toast(msg, 'error');
  }

  /* Datos capturados, sin campos de solo lectura ni auxiliares */
  function capturar() {
    var d = MC.leerForm(form);
    ['motivo-baja-temporal', 'motivo-baja-definitiva'].forEach(function (k) { delete d[k]; });
    (cfg.noEditables || []).forEach(function (k) { if (modo !== 'crear') delete d[k]; });
    if (fotoNueva) d.foto = fotoNueva;
    return d;
  }

  /* Reglas comunes: campos únicos y validaciones propias del módulo */
  function validar(d) {
    var regla = cfg.validar && cfg.validar(d);
    if (regla) { marcarInvalido(regla[0], regla[1]); return Promise.resolve(false); }
    var campos = Object.keys(cfg.unicos || {}).filter(function (k) { return d[k]; });
    return Promise.all(campos.map(function (k) {
      return MC.datos.buscar(cfg.coleccion, function (r) {
        return String(r[k]).toLowerCase() === String(d[k]).toLowerCase() && (!actual || r.folio !== actual.folio);
      }).then(function (dup) { return dup ? k : null; });
    })).then(function (dups) {
      var k = dups.filter(Boolean)[0];
      if (k) { marcarInvalido(k, cfg.unicos[k]); return false; }
      return true;
    });
  }

  function pintarFoto(src) {
    if (!avatar) return;
    avatar.innerHTML = src ? '<img alt="Foto" src="' + src + '">' : iconoAvatar;
  }

  /* Guarda la foto elegida como data URL (si es ligera) */
  var inputFoto = form.querySelector('input[type=file][data-previsualizar]');
  if (inputFoto) inputFoto.addEventListener('change', function () {
    var f = inputFoto.files[0];
    if (!f) return;
    if (f.size > 400 * 1024) { fotoNueva = null; return MC.toast('La imagen se mostrará pero no se guardará (máx. 400 KB)', 'info'); }
    var lector = new FileReader();
    lector.onload = function () { fotoNueva = lector.result; cambiosPendientes = true; };
    lector.readAsDataURL(f);
  });

  /* ---------- Alta ---------- */
  if (modo === 'crear') {
    MC.datos.siguienteFolio(cfg.coleccion).then(function (f) { if (folioEl) folioEl.title = 'Se asignará el folio ' + f; });
    form.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var d = capturar();
      validar(d).then(function (ok) {
        if (!ok) return;
        d.estado = ESTADOS.activo;
        if (cfg.alCrear) cfg.alCrear(d);
        return MC.datos.crear(cfg.coleccion, d).then(function (nuevo) {
          MC.toast(cfg.nombre + ' creado con folio ' + nuevo.folio + (cfg.avisoCrear ? '. ' + cfg.avisoCrear : ''), 'success');
          MC.ir(pagina('consulta') + '?folio=' + encodeURIComponent(nuevo.folio), 1400);
        });
      });
    });
    return;
  }

  /* ---------- Modificar / baja / consulta: listado + registro elegido ---------- */
  function acciones(r) {
    var ops = [['consulta', 'fa-eye', 'Consultar'], ['modificar', 'fa-pen-to-square', 'Modificar'], ['baja', 'fa-trash-can', 'Baja']];
    return ops.filter(function (o) { return o[0] !== modo; }).map(function (o) {
      return '<a href="' + pagina(o[0]) + '?folio=' + encodeURIComponent(r.folio) + '" title="' + o[2] + '" aria-label="' + o[2] + ' ' + MC.esc(r.folio) + '"><i class="fa-solid ' + o[1] + '"></i></a>';
    }).join('');
  }
  var lista = MC.listado({
    antesDe: form, coleccion: cfg.coleccion, columnas: cfg.columnas, buscarEn: cfg.buscarEn, porPagina: 5,
    placeholder: 'Buscar por folio, nombre...', seleccionado: MC.param('folio'), acciones: acciones,
    alSeleccionar: function (r) { elegir(r); }
  });

  function elegir(r) {
    if (modo === 'modificar' && cambiosPendientes && actual && actual.folio !== r.folio) {
      return MC.confirmar('Cambios sin guardar', 'Tienes cambios sin guardar en el folio ' + actual.folio + '. ¿Deseas descartarlos?', 'Descartar').then(function (si) {
        if (si) { cambiosPendientes = false; cargar(r); } else lista.seleccionar(actual.folio);
      });
    }
    cargar(r);
  }

  function cargar(r) {
    actual = r;
    fotoNueva = null;
    cambiosPendientes = false;
    form.hidden = false;
    var datos = {};
    Object.keys(r).forEach(function (k) { datos[k] = r[k]; });
    delete datos.password;
    MC.llenarForm(form, datos);
    if (folioEl) folioEl.textContent = r.folio;
    if (estadoEl) estadoEl.textContent = r.estado;
    pintarFoto(r.foto);
    lista.seleccionar(r.folio);
    history.replaceState(null, '', pagina(modo) + '?folio=' + encodeURIComponent(r.folio));
    actualizarBotones();
  }

  function sinSeleccion() {
    actual = null;
    form.hidden = true;
  }

  var folioInicial = MC.param('folio');
  if (folioInicial) {
    MC.datos.obtener(cfg.coleccion, folioInicial).then(cargar).catch(function (err) { sinSeleccion(); MC.toast(err.message, 'error'); });
  } else sinSeleccion();

  /* En transporte el VIN funciona como buscador (RN_192 / RN_206) */
  var vin = form.querySelector('#vin');
  if (vin) {
    vin.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var v = vin.value.trim().toUpperCase();
      MC.datos.buscar(cfg.coleccion, function (r) { return String(r.vin).toUpperCase() === v; }).then(function (r) {
        if (r) { cargar(r); lista.refrescar(); MC.toast('Unidad encontrada', 'success'); }
        else MC.toast('No existe una unidad con el VIN ' + v, 'error');
      });
    });
    if (modo === 'modificar') vin.readOnly = true;
  }

  function actualizarBotones() {
    var bajaDefinitiva = actual && actual.estado === ESTADOS.definitiva;
    var inactivo = actual && actual.estado === ESTADOS.temporal;
    if (modo === 'modificar') {
      var guardar = form.querySelector('button[type=submit]');
      if (guardar) guardar.disabled = bajaDefinitiva;
      if (bajaDefinitiva) MC.toast('Este registro tiene baja definitiva y ya no puede modificarse', 'info');
    }
    if (modo === 'baja') {
      var btnTemp = form.querySelector('[data-modal-abrir="modal-temporal"]');
      var btnDef = form.querySelector('[data-modal-abrir="modal-definitiva"]');
      if (btnTemp) { btnTemp.disabled = bajaDefinitiva; btnTemp.textContent = inactivo ? 'Reactivar' : 'Baja temporal'; }
      if (btnDef) btnDef.disabled = bajaDefinitiva;
      if (bajaDefinitiva) MC.toast('Este registro ya tiene baja definitiva', 'info'); // RN_196
    }
  }

  /* ---------- Modificar ---------- */
  if (modo === 'modificar') {
    form.addEventListener('input', function () { if (actual) cambiosPendientes = true; });
    form.addEventListener('change', function () { if (actual) cambiosPendientes = true; });
    form.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      if (!actual) return MC.toast('Selecciona un registro del listado', 'error');
      var d = capturar();
      validar(d).then(function (ok) {
        if (!ok) return false;
        return MC.confirmar('Guardar cambios', '¿Deseas guardar los cambios del folio ' + actual.folio + '?', 'Guardar cambios'); // RN_194
      }).then(function (si) {
        if (!si) return;
        return MC.datos.actualizar(cfg.coleccion, actual.folio, d).then(function (r) {
          cambiosPendientes = false;
          MC.toast('Cambios guardados con éxito', 'success');
          MC.ir(pagina('consulta') + '?folio=' + encodeURIComponent(r.folio), 900);
        });
      });
    });

    /* RN_195: confirmar antes de salir con cambios sin guardar */
    var regresar = Array.prototype.find.call(form.querySelectorAll('button[data-ir]'), function (b) { return /regresar/i.test(b.textContent); });
    if (regresar) {
      var destinoRegresar = regresar.getAttribute('data-ir');
      MC.tomarBoton(regresar, function () {
        if (!cambiosPendientes) return MC.ir(destinoRegresar);
        MC.confirmar('Cambios sin guardar', 'Hay modificaciones que no se han guardado. ¿Deseas salir sin guardar?', 'Salir sin guardar')
          .then(function (si) { if (si) MC.ir(destinoRegresar); });
      });
    }
  }

  /* ---------- Baja ---------- */
  if (modo === 'baja') {
    var aplicarBaja = function (tipo) {
      if (!actual) return MC.toast('Selecciona un registro del listado', 'error');
      var cambios = {};
      var reactivar = tipo === 'temporal' && actual.estado === ESTADOS.temporal;
      if (cfg.motivos && !reactivar) {
        var campo = document.getElementById(cfg.motivos[tipo]);
        var error = document.getElementById(tipo === 'temporal' ? 'error-motivo-temp' : 'error-motivo-def');
        var motivo = campo ? campo.value.trim() : '';
        if (campo && !motivo) {
          campo.setAttribute('aria-invalid', 'true');
          if (error) error.style.display = 'block';
          campo.focus();
          return MC.toast('El motivo es obligatorio para procesar la baja', 'error');
        }
        if (error) error.style.display = 'none';
        if (campo) { campo.removeAttribute('aria-invalid'); campo.value = ''; }
        cambios.motivoBaja = motivo;
      }
      cambios.estado = reactivar ? ESTADOS.activo : ESTADOS[tipo];
      cambios.fechaBaja = reactivar ? null : MC.hoy();
      MC.datos.actualizar(cfg.coleccion, actual.folio, cambios).then(function (r) {
        document.querySelectorAll('.modal-backdrop.open').forEach(function (m) { m.classList.remove('open'); });
        var msg = reactivar ? 'Registro reactivado' : tipo === 'temporal' ? 'Baja temporal registrada' : 'Baja definitiva procesada';
        MC.toast(msg + ' · folio ' + r.folio, 'success');
        MC.ir(pagina('consulta') + '?folio=' + encodeURIComponent(r.folio), 900);
      });
    };
    MC.tomarBoton(document.querySelector('#modal-temporal .btn-primary'), function () { aplicarBaja('temporal'); });
    MC.tomarBoton(document.querySelector('#modal-definitiva .btn-danger'), function () { aplicarBaja('definitiva'); });

    /* Al reactivar no se pide motivo: se ajusta el texto del modal */
    var abrirTemp = form.querySelector('[data-modal-abrir="modal-temporal"]');
    if (abrirTemp) abrirTemp.addEventListener('click', function () {
      var m = document.getElementById('modal-temporal');
      var reactivar = actual && actual.estado === ESTADOS.temporal;
      var motivoGrupo = m.querySelector('.campo-grupo');
      if (motivoGrupo) motivoGrupo.hidden = !!reactivar;
      m.querySelector('h2').textContent = reactivar ? 'Confirmar reactivación' : 'Confirmar baja temporal';
      m.querySelector('.btn-primary').textContent = reactivar ? 'Reactivar' : 'Confirmar baja temporal';
    });
  }
})();
