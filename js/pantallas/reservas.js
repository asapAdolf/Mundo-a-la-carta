/**
 * reservas.js - Reservaciones, recepciones e inmersiones (PA_07_xx).
 * Requiere datos.js y comun.js.
 *
 * Flujo de reservación:  crear → disponibilidad (fecha y sala) → crear → resumen → recibo
 * Recepción / inmersión: se registran sobre el folio de una reservación activa.
 * Consultar, modificar y cancelar trabajan con ?folio= o con el campo "Folio de reservación".
 */
(function () {
  'use strict';
  var MC = window.MC;
  var archivo = (window.location.pathname.split('/').pop() || '').replace('.html', '');
  var COLECCION = { reservacion: 'reservaciones', recepcion: 'recepciones', inmersion: 'inmersiones' };
  var CAPACIDAD = { 'Sala 1': 6, 'Sala 2': 8, 'Sala 3': 10, 'Sala 4': 12, 'Sala 5': 14, 'Sala 6': 16 };
  var MULTA = 0.15;
  var DIAS_ANTICIPACION = 2; // cancelar con 2 días o más de anticipación genera devolución sin multa
  var IVA_RECIBO = 0.16;

  var partes = archivo.match(/^(reservacion|recepcion|inmersion)-(crear|modificar|consultar|cancelar-devolucion|cancelar|resumen)$/);
  var tipo = partes ? partes[1] : null;
  var modo = partes ? partes[2] : archivo;
  var col = tipo && COLECCION[tipo];
  var claveBorrador = function (t) { return 'reserva_' + t; };
  var sesion = MC.sesion.actual();

  /* ---------- Utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function diasHasta(iso) {
    var hoy = new Date(MC.hoy() + 'T00:00:00');
    return Math.round((new Date(iso + 'T00:00:00') - hoy) / 86400000);
  }
  function fechaLarga(iso) {
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var p = String(iso || '').split('-');
    return p.length === 3 ? Number(p[2]) + ' de ' + meses[Number(p[1]) - 1] + ' de ' + p[0] : '';
  }
  function siNo(v) { return v ? 'Sí' : 'No'; }
  function ponerDD(contenedor, etiqueta, valor) {
    var dt = Array.prototype.find.call(contenedor.querySelectorAll('dt'), function (x) { return x.textContent.trim() === etiqueta; });
    if (dt && dt.nextElementSibling) dt.nextElementSibling.textContent = valor;
  }
  function pintarEstado(estado) {
    var ins = document.querySelector('.estado-reserva .insignia');
    if (!ins) return;
    ins.textContent = estado;
    ins.className = 'insignia ' + (estado === 'Activa' ? 'insignia--ok' : 'insignia--mal');
  }
  function precioPersona(datos) {
    return Number(datos['precio-persona']) || MC.PRECIO_MENU[datos['tipo-menu']] || 0;
  }
  function calcularMonto(datos) {
    return (precioPersona(datos) * (parseInt(datos.comensales, 10) || 0)).toFixed(2);
  }

  /* Muestra un registro en el formulario (fecha en formato dd/mm/aaaa) */
  function mostrar(form, r) {
    var d = {};
    Object.keys(r).forEach(function (k) { d[k] = r[k]; });
    d.fecha = MC.fechaMx(r.fecha);
    if (form.querySelector('#precio-persona')) d['precio-persona'] = String(precioPersona(r));
    MC.llenarForm(form, d);
    if (r.estado) pintarEstado(r.estado);
  }

  /* Campos editables en la pantalla actual (ni de solo lectura ni deshabilitados) */
  function editables(form) {
    var d = {};
    form.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (c) {
      if (c.readOnly || c.disabled || c.id === 'folio' || c.id === 'acepto') return;
      d[c.id] = c.type === 'checkbox' ? c.checked : c.value.trim();
    });
    return d;
  }

  /* Recalcula hora de salida (+3 h) y monto cuando cambian los datos */
  function enlazarCalculos(form) {
    var entrada = $('hora-entrada');
    var salida = $('hora-salida');
    var monto = $('monto-reserva');
    function recalcular() {
      if (entrada && salida) salida.value = entrada.value ? MC.sumarHoras(entrada.value, 3) : '';
      if (monto) {
        var d = MC.leerForm(form);
        if (Number(d.comensales) && precioPersona(d)) monto.value = calcularMonto(d);
      }
    }
    form.addEventListener('input', recalcular);
    form.addEventListener('change', recalcular);
    return recalcular;
  }

  /* Carga una reservación (o recepción / inmersión) por folio desde el campo o ?folio= */
  function enlazarFolio(form, coleccion, alCargar) {
    var campo = $('folio');
    var ultimo = null;
    function buscar(folio) {
      if (!folio || folio === ultimo) return;
      ultimo = folio;
      MC.datos.obtener(coleccion, folio).then(function (r) {
        if (sesion && sesion.tipo === 'cliente' && r.clienteFolio && r.clienteFolio !== sesion.folio) {
          return MC.toast('Ese folio no pertenece a tus reservaciones', 'error');
        }
        history.replaceState(null, '', archivo + '.html?folio=' + encodeURIComponent(r.folio));
        alCargar(r);
      }).catch(function () {
        ultimo = null;
        if (campo) campo.setAttribute('aria-invalid', 'true');
        MC.toast('No existe un registro con el folio ' + folio, 'error');
      });
    }
    if (campo) {
      campo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); buscar(campo.value.trim()); }
      });
      campo.addEventListener('change', function () { buscar(campo.value.trim()); });
      campo.value = '';
    }
    buscar(MC.param('folio'));
    return buscar;
  }

  /* Listado paginado para las pantallas de consulta */
  function listadoReservas(form, coleccion) {
    var filtro = sesion && sesion.tipo === 'cliente' ? function (r) { return r.clienteFolio === sesion.folio; } : null;
    var acciones = function (r) {
      var ops = tipo === 'inmersion' ? [['modificar', 'fa-pen-to-square', 'Modificar']]
        : [['modificar', 'fa-pen-to-square', 'Modificar'], ['cancelar', 'fa-trash-can', 'Cancelar']];
      return ops.map(function (o) {
        return '<a href="' + tipo + '-' + o[0] + '.html?folio=' + encodeURIComponent(r.folio) + '" title="' + o[2] + '"><i class="fa-solid ' + o[1] + '"></i></a>';
      }).join('');
    };
    return MC.listado({
      antesDe: form, coleccion: coleccion, porPagina: 5, filtro: filtro, seleccionado: MC.param('folio'),
      placeholder: 'Buscar por folio, cliente o evento...', buscarEn: ['folio', 'cliente', 'tipo-evento', 'sala'],
      orden: function (a, b) { return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0; },
      columnas: [
        { titulo: 'Folio', campo: 'folio' }, { titulo: 'Fecha', render: function (r) { return MC.fechaMx(r.fecha); } },
        { titulo: 'Cliente', campo: 'cliente' }, { titulo: 'Evento', campo: 'tipo-evento' }, { titulo: 'Sala', campo: 'sala' },
        { titulo: 'Comensales', campo: 'comensales' }, { titulo: 'Estado', render: function (r) { return MC.insigniaEstado(r.estado); } }
      ],
      acciones: sesion && sesion.tipo === 'cliente' ? null : acciones,
      alSeleccionar: function (r) {
        history.replaceState(null, '', archivo + '.html?folio=' + encodeURIComponent(r.folio));
        mostrar(form, r);
      }
    });
  }

  /* Botón "Consultar disponibilidad": guarda lo capturado y abre la pantalla de salas */
  function enlazarDisponibilidad(form, folioActual) {
    var btn = form.querySelector('[data-ir="disponibilidad.html"]');
    MC.tomarBoton(btn, function () {
      var previo = MC.temporal.leer(claveBorrador(tipo)) || {};
      var datos = MC.leerForm(form);
      ['fecha', 'sala', 'ambientacion'].forEach(function (k) { if (previo[k]) datos[k] = previo[k]; });
      if (folioActual()) datos.folioReserva = folioActual();
      datos.origen = window.location.pathname.split('/').pop() + window.location.search;
      MC.temporal.guardar(claveBorrador(tipo), datos);
      MC.temporal.guardar('disponibilidad_tipo', tipo);
      MC.ir('disponibilidad.html');
    });
  }

  /* ======================================================================
     ALTA DE RESERVACIÓN
     ====================================================================== */
  if (tipo === 'reservacion' && modo === 'crear') {
    var formAlta = document.querySelector('form.tarjeta-pantalla');
    var recalcAlta = enlazarCalculos(formAlta);
    var borrador = MC.temporal.leer(claveBorrador('reservacion'));
    if (borrador && !borrador.folioReserva) {
      MC.llenarForm(formAlta, borrador);
      if (borrador.fecha) $('fecha').value = MC.fechaMx(borrador.fecha);
      if (borrador.sala) MC.toast('Fecha y sala seleccionadas: ' + MC.fechaMx(borrador.fecha) + ' · ' + borrador.sala, 'info');
    } else {
      MC.temporal.borrar(claveBorrador('reservacion'));
    }
    if (!borrador || !borrador.fecha) $('fecha').value = 'Pendiente';
    if (borrador && borrador.ambientacion && !borrador.sala) MC.toast('Experiencia elegida: ' + borrador.ambientacion + '. Consulta la disponibilidad para elegir fecha y sala', 'info');
    if (sesion && sesion.tipo === 'cliente' && !$('cliente').value) $('cliente').value = sesion.nombre;
    recalcAlta();
    enlazarDisponibilidad(formAlta, function () { return null; });

    formAlta.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var previo = MC.temporal.leer(claveBorrador('reservacion')) || {};
      if (!previo.fecha || !previo.sala) return MC.toast('Consulta la disponibilidad para elegir fecha y sala', 'error');
      if (!(Number(e.detail.datos.comensales) > 0)) return MC.toast('Indica el número de comensales', 'error');
      if (Number(e.detail.datos.comensales) > CAPACIDAD[previo.sala]) return MC.toast(previo.sala + ' tiene capacidad para ' + CAPACIDAD[previo.sala] + ' personas', 'error');
      var datos = editables(formAlta);
      datos.fecha = previo.fecha;
      datos.sala = previo.sala;
      datos.ambientacion = previo.ambientacion;
      datos['hora-salida'] = MC.sumarHoras(datos['hora-entrada'], 3);
      datos['precio-persona'] = String(precioPersona(datos));
      datos['monto-reserva'] = calcularMonto(datos);
      datos.origen = previo.origen;
      MC.temporal.guardar(claveBorrador('reservacion'), datos);
      MC.toast('Datos validados, revisa el resumen', 'success');
      MC.ir('reservacion-resumen.html', 600);
    });
  }

  /* ======================================================================
     ALTA DE RECEPCIÓN / INMERSIÓN (sobre una reservación existente)
     ====================================================================== */
  if ((tipo === 'recepcion' || tipo === 'inmersion') && modo === 'crear') {
    var formLigada = document.querySelector('form.tarjeta-pantalla');
    var base = null;
    var borradorRec = tipo === 'recepcion' ? MC.temporal.leer(claveBorrador('recepcion')) : null;

    var buscarLigada = enlazarFolio(formLigada, 'reservaciones', function (r) {
      MC.datos.buscar(col, function (x) { return x.folio === r.folio; }).then(function (existe) {
        if (r.estado !== 'Activa') return MC.toast('La reservación ' + r.folio + ' no está activa', 'error');
        if (existe) return MC.toast('La reservación ' + r.folio + ' ya tiene ' + (tipo === 'recepcion' ? 'una recepción' : 'una inmersión') + ' registrada', 'error');
        base = r;
        mostrar(formLigada, r);
        $('folio').value = r.folio;
        if (borradorRec && borradorRec.folio === r.folio) $('observaciones').value = borradorRec.observaciones || '';
        MC.toast('Reservación ' + r.folio + ' de ' + r.cliente + ' cargada', 'success');
      });
    });
    if (!MC.param('folio') && borradorRec && borradorRec.folio) buscarLigada(borradorRec.folio);

    formLigada.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      if (!base || String(base.folio) !== String($('folio').value.trim())) return MC.toast('Escribe el folio de una reservación activa y presiona Enter', 'error');
      var datos = JSON.parse(JSON.stringify(base));
      datos.observaciones = $('observaciones').value.trim();
      datos.estado = 'Activa';
      if (tipo === 'recepcion') {
        MC.temporal.guardar(claveBorrador('recepcion'), datos);
        MC.toast('Datos validados, revisa el resumen', 'success');
        return MC.ir('recepcion-resumen.html', 600);
      }
      MC.datos.crear('inmersiones', datos).then(function (r) {
        MC.toast('Inmersión guardada para la reservación ' + r.folio, 'success');
        MC.ir('inmersion-consultar.html?folio=' + encodeURIComponent(r.folio), 900);
      }).catch(function (err) { MC.toast(err.message, 'error'); });
    });
  }

  /* ======================================================================
     RESUMEN (reservación y recepción)
     ====================================================================== */
  if (modo === 'resumen') {
    var datosRes = MC.temporal.leer(claveBorrador(tipo));
    var dl = document.querySelector('.resumen-datos');
    var btnConfirmar = $('btn-confirmar-resumen');
    var acepto = $('acepto');
    if (!datosRes) {
      MC.toast('No hay datos capturados. Regresando al alta...', 'error');
      MC.ir(tipo + '-crear.html', 1000);
    } else {
      ponerDD(dl, 'Fecha', MC.fechaMx(datosRes.fecha));
      ponerDD(dl, 'Tipo de evento', datosRes['tipo-evento']);
      ponerDD(dl, 'Hora de entrada', datosRes['hora-entrada']);
      ponerDD(dl, 'Nombre del cliente', datosRes.cliente);
      ponerDD(dl, 'Número de comensales', datosRes.comensales);
      ponerDD(dl, 'Hora de salida', datosRes['hora-salida']);
      ponerDD(dl, 'Tipo de ambientación', datosRes.ambientacion || '—');
      ponerDD(dl, 'Tipo de mesa', datosRes['tipo-mesa']);
      ponerDD(dl, 'Menú vegetariano', siNo(datosRes.vegetariano));
      ponerDD(dl, 'Alergias', datosRes.alergias);
      ponerDD(dl, 'Menú vegano', siNo(datosRes.vegano));
      ponerDD(dl, 'Posible monto a pagar', MC.dinero(datosRes['monto-reserva']));
      if (datosRes.folio) ponerDD(dl, 'Folio', datosRes.folio);
      else MC.datos.siguienteFolio('reservaciones').then(function (f) { ponerDD(dl, 'Folio', f); });
    }
    var regresarRes = document.querySelector('.acciones [data-ir$="-crear.html"]');
    if (regresarRes && datosRes && datosRes.folio && tipo === 'recepcion') regresarRes.setAttribute('data-ir', 'recepcion-crear.html?folio=' + encodeURIComponent(datosRes.folio));

    MC.tomarBoton(btnConfirmar, function () {
      if (!datosRes) return;
      if (!acepto.checked) return MC.toast('Debes aceptar los datos para continuar', 'error');
      var registro = JSON.parse(JSON.stringify(datosRes));
      delete registro.origen;
      delete registro.folioReserva;
      registro.estado = 'Activa';
      if (tipo === 'reservacion' && sesion && sesion.tipo === 'cliente') registro.clienteFolio = sesion.folio;
      btnConfirmar.disabled = true;
      MC.datos.crear(col, registro).then(function (r) {
        MC.temporal.borrar(claveBorrador(tipo));
        if (tipo === 'reservacion') {
          MC.toast('Reservación confirmada con folio ' + r.folio, 'success');
          MC.ir('recibo-reserva.html?folio=' + encodeURIComponent(r.folio), 900);
        } else {
          MC.toast('Recepción registrada', 'success');
          MC.ir('recepcion-consultar.html?folio=' + encodeURIComponent(r.folio), 900);
        }
      }).catch(function (err) { btnConfirmar.disabled = false; MC.toast(err.message, 'error'); });
    });
    if (btnConfirmar && acepto) {
      btnConfirmar.disabled = true;
      acepto.addEventListener('change', function () { btnConfirmar.disabled = !acepto.checked; });
    }
  }

  /* ======================================================================
     CONSULTAR
     ====================================================================== */
  if (modo === 'consultar') {
    var formCons = document.querySelector('form.tarjeta-pantalla');
    var listaCons = listadoReservas(formCons, col);
    enlazarFolio(formCons, col, function (r) {
      mostrar(formCons, r);
      listaCons.seleccionar(r.folio);
    });
    var modificarBtn = formCons.querySelector('[data-ir="inmersion-modificar.html"]');
    MC.tomarBoton(modificarBtn, function () {
      var f = MC.param('folio');
      MC.ir('inmersion-modificar.html' + (f ? '?folio=' + encodeURIComponent(f) : ''));
    });
  }

  /* ======================================================================
     MODIFICAR
     ====================================================================== */
  if (modo === 'modificar') {
    var formMod = document.querySelector('form.tarjeta-pantalla');
    var actualMod = null;
    var recalcMod = enlazarCalculos(formMod);
    enlazarFolio(formMod, col, function (r) {
      actualMod = r;
      mostrar(formMod, r);
      $('folio').value = r.folio;
      var b = MC.temporal.leer(claveBorrador(tipo));
      if (b && b.folioReserva === r.folio) {
        MC.llenarForm(formMod, b);
        $('fecha').value = MC.fechaMx(b.fecha || r.fecha);
      }
      recalcMod();
      if (r.estado !== 'Activa') MC.toast('Este registro está en estado ' + r.estado + ' y no puede modificarse', 'info');
    });
    if (formMod.querySelector('[data-ir="disponibilidad.html"]')) enlazarDisponibilidad(formMod, function () { return actualMod && actualMod.folio; });

    var guardarMod = function () {
      if (!actualMod) return MC.toast('Escribe el folio y presiona Enter para cargar el registro', 'error');
      if (actualMod.estado !== 'Activa') return MC.toast('Solo se pueden modificar registros activos', 'error');
      var cambios = editables(formMod);
      var b = MC.temporal.leer(claveBorrador(tipo));
      if (b && b.folioReserva === actualMod.folio) {
        ['fecha', 'sala', 'ambientacion'].forEach(function (k) { if (b[k]) cambios[k] = b[k]; });
      }
      var completo = Object.assign({}, actualMod, cambios);
      cambios['hora-salida'] = MC.sumarHoras(completo['hora-entrada'], 3);
      cambios['monto-reserva'] = calcularMonto(completo);
      MC.datos.actualizar(col, actualMod.folio, cambios).then(function (r) {
        MC.temporal.borrar(claveBorrador(tipo));
        MC.toast('Cambios guardados', 'success');
        MC.ir(tipo + '-consultar.html?folio=' + encodeURIComponent(r.folio), 800);
      });
    };
    formMod.addEventListener('mc:enviar', function (e) { e.preventDefault(); guardarMod(); });
    /* Inmersión: "Personalizar" guarda los cambios (incluye precio por persona) */
    var personalizar = Array.prototype.find.call(formMod.querySelectorAll('button'), function (b) { return /personalizar/i.test(b.textContent); });
    MC.tomarBoton(personalizar, function () {
      var pp = $('precio-persona');
      if (pp && !/^\d+(\.\d{1,2})?$/.test(pp.value.trim())) { pp.setAttribute('aria-invalid', 'true'); return MC.toast('Escribe un precio por persona válido', 'error'); }
      guardarMod();
    });
  }

  /* ======================================================================
     CANCELAR (con multa) y CANCELAR CON DEVOLUCIÓN
     ====================================================================== */
  if (modo === 'cancelar' || modo === 'cancelar-devolucion') {
    var formCan = document.querySelector('form.tarjeta-pantalla');
    var actualCan = null;
    enlazarFolio(formCan, col, function (r) {
      actualCan = r;
      mostrar(formCan, r);
      $('folio').value = r.folio;
      var monto = Number(r['monto-reserva']) || 0;
      if ($('multa')) $('multa').value = (monto * MULTA).toFixed(2);
      if ($('monto-devolver')) $('monto-devolver').value = monto.toFixed(2);
      if (r.estado !== 'Activa') MC.toast('Este registro ya está en estado ' + r.estado, 'info');
    });

    formCan.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      if (!actualCan) return MC.toast('Escribe el folio y presiona Enter para cargar el registro', 'error');
      if (actualCan.estado !== 'Activa') return MC.toast('Solo se pueden cancelar registros activos', 'error');
      var cambios = { fechaCancelacion: MC.hoy(), observaciones: $('observaciones').value.trim() };

      if (modo === 'cancelar' && tipo === 'reservacion' && diasHasta(actualCan.fecha) >= DIAS_ANTICIPACION) {
        MC.toast('Cancelación anticipada: no aplica multa, se registra la devolución', 'info');
        return MC.ir('reservacion-cancelar-devolucion.html?folio=' + encodeURIComponent(actualCan.folio), 1200);
      }
      if (modo === 'cancelar') {
        cambios.estado = 'Baja';
        cambios.multa = $('multa').value;
      } else {
        cambios.estado = 'Cancelada';
        cambios.motivoCancelacion = $('motivo').value.trim();
        cambios['observaciones-cancelacion'] = $('observaciones-cancelacion').value.trim();
        cambios.devolucion = $('monto-devolver').value;
        cambios['medio-devolucion'] = $('medio-devolucion').value;
      }
      MC.datos.actualizar(col, actualCan.folio, cambios).then(function (r) {
        MC.toast(modo === 'cancelar'
          ? (tipo === 'reservacion' ? 'Reservación' : 'Recepción') + ' dada de baja. Multa aplicada: ' + MC.dinero(r.multa)
          : 'Reservación cancelada. Devolución de ' + MC.dinero(r.devolucion) + ' registrada', 'success');
        MC.ir(tipo + '-consultar.html?folio=' + encodeURIComponent(r.folio), 1100);
      });
    });
  }

  /* ======================================================================
     DISPONIBILIDAD DE SALAS
     ====================================================================== */
  if (archivo === 'disponibilidad') {
    var formDisp = document.querySelector('form.tarjeta-pantalla');
    var tipoDisp = MC.temporal.leer('disponibilidad_tipo') || 'reservacion';
    var borradorDisp = MC.temporal.leer(claveBorrador(tipoDisp)) || {};
    var etiqueta = $('sala-elegida');
    var confirmar = $('btn-confirmar-sala');
    var fechaDisp = $('fecha');
    fechaDisp.min = MC.hoy();

    MC.llenarForm(formDisp, {
      fecha: borradorDisp.fecha || '', 'tipo-evento': borradorDisp['tipo-evento'] || '', 'hora-entrada': borradorDisp['hora-entrada'] || '',
      comensales: borradorDisp.comensales || '', 'tipo-menu': borradorDisp['tipo-menu'] || '', ambientacion: borradorDisp.ambientacion || ''
    });

    var aMin = function (h) { var p = String(h || '00:00').split(':'); return Number(p[0]) * 60 + Number(p[1] || 0); };
    function pintarSalas() {
      var fecha = fechaDisp.value;
      var hora = $('hora-entrada').value;
      var personas = parseInt($('comensales').value, 10) || 0;
      MC.datos.listar('reservaciones', {
        filtro: function (r) {
          return r.estado === 'Activa' && r.fecha === fecha && r.folio !== borradorDisp.folioReserva &&
            (!hora || Math.abs(aMin(r['hora-entrada']) - aMin(hora)) < 180);
        }
      }).then(function (res) {
        var ocupadas = res.items.map(function (r) { return r.sala; });
        document.querySelectorAll('.sala').forEach(function (s) {
          var nombre = s.dataset.nombre;
          var ocupada = !!fecha && ocupadas.indexOf(nombre) !== -1;
          var pequena = personas > CAPACIDAD[nombre];
          s.disabled = ocupada || pequena;
          s.querySelector('small').textContent = ocupada ? 'Ocupada' : CAPACIDAD[nombre] + ' personas';
          if (s.disabled && s.classList.contains('seleccionada')) { s.classList.remove('seleccionada'); etiqueta.value = ''; }
        });
        confirmar.disabled = !etiqueta.value;
      });
    }
    document.querySelectorAll('.sala').forEach(function (s) {
      s.addEventListener('click', function () {
        if (s.disabled) return;
        document.querySelectorAll('.sala').forEach(function (x) { x.classList.remove('seleccionada'); });
        s.classList.add('seleccionada');
        etiqueta.value = s.dataset.nombre;
        confirmar.disabled = false;
      });
      if (borradorDisp.sala === s.dataset.nombre) { s.classList.add('seleccionada'); etiqueta.value = s.dataset.nombre; }
    });
    ['fecha', 'hora-entrada', 'comensales'].forEach(function (id) { $(id).addEventListener('change', pintarSalas); $(id).addEventListener('input', pintarSalas); });
    pintarSalas();

    var regresarDisp = formDisp.querySelector('.acciones [data-ir="back"]');
    if (regresarDisp && borradorDisp.origen) regresarDisp.setAttribute('data-ir', borradorDisp.origen);

    formDisp.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var d = e.detail.datos;
      if (!d.fecha) { fechaDisp.setAttribute('aria-invalid', 'true'); return MC.toast('Selecciona la fecha del evento', 'error'); }
      if (d.fecha < MC.hoy()) return MC.toast('La fecha no puede ser anterior a hoy', 'error');
      if (!d['hora-entrada']) return MC.toast('Indica la hora de entrada', 'error');
      if (!etiqueta.value) return MC.toast('Selecciona una sala disponible', 'error');
      ['fecha', 'tipo-evento', 'hora-entrada', 'comensales', 'ambientacion'].forEach(function (k) { borradorDisp[k] = d[k]; });
      if (d['tipo-menu']) borradorDisp['tipo-menu'] = d['tipo-menu'];
      borradorDisp.sala = etiqueta.value;
      MC.temporal.guardar(claveBorrador(tipoDisp), borradorDisp);
      MC.toast(etiqueta.value + ' asignada para el ' + MC.fechaMx(d.fecha), 'success');
      MC.ir(borradorDisp.origen || 'reservacion-crear.html', 700);
    });
  }

  /* ======================================================================
     RECIBO
     ====================================================================== */
  if (archivo === 'recibo-reserva') {
    var folioRecibo = MC.param('folio');
    var cuerpoRecibo = document.querySelector('.recibo-cuerpo');
    if (!folioRecibo) {
      MC.toast('Abre el recibo desde una reservación confirmada', 'info');
    } else {
      MC.datos.obtener('reservaciones', folioRecibo).then(function (r) {
        var dlR = cuerpoRecibo.querySelector('.resumen-datos');
        ponerDD(dlR, 'Fecha', fechaLarga(r.fecha));
        ponerDD(dlR, 'Horario', r['hora-entrada'] + ' a ' + r['hora-salida']);
        ponerDD(dlR, 'Mesa', r.sala + ' (' + r['tipo-mesa'] + ')');
        ponerDD(dlR, 'Comensales', r.comensales + (Number(r.comensales) === 1 ? ' persona' : ' personas'));
        ponerDD(dlR, 'Tipo de menú', r['tipo-menu']);
        ponerDD(dlR, 'Tipo de ambientación', r.ambientacion || '—');
        var sub = Number(r['monto-reserva']) || 0;
        var lineas = cuerpoRecibo.querySelectorAll('.recibo-lineas li span:last-child');
        lineas[0].textContent = MC.dinero(sub);
        lineas[1].textContent = MC.dinero(sub * IVA_RECIBO);
        lineas[2].textContent = MC.dinero(sub * (1 + IVA_RECIBO));
        document.querySelector('.recibo > p').textContent = 'Aquí tienes los detalles de tu reserva con folio ' + r.folio + '. Tu reserva ha sido confirmada.';
      }).catch(function (err) { MC.toast(err.message, 'error'); });
    }
    var verReservas = document.querySelector('[data-ir="reservacion-consultar.html"]');
    if (verReservas && folioRecibo) verReservas.setAttribute('data-ir', 'reservacion-consultar.html?folio=' + encodeURIComponent(folioRecibo));
  }
})();
