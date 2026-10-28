/**
 * devolucion.js - Devoluciones de compras (al proveedor) y de ventas de souvenirs (CU_14).
 * Requiere datos.js y comun.js.
 *
 * Compras: buscar orden → datos de la orden → confirmar → completada
 * Ventas:  buscar ticket → solicitar (Pendiente) → autorizar | rechazar → comprobante
 */
(function () {
  'use strict';
  var MC = window.MC;
  var archivo = (window.location.pathname.split('/').pop() || '').replace('.html', '');
  var $ = function (id) { return document.getElementById(id); };
  var sesion = MC.sesion.actual();
  var IVA = 0.16; // los precios de venta incluyen IVA

  /* Escribe el valor de un <dt>/<dd> o de un bloque .dato por su etiqueta */
  function poner(etiqueta, valor, html) {
    var dt = Array.prototype.find.call(document.querySelectorAll('dt'), function (x) { return x.textContent.trim() === etiqueta; });
    var destino = dt ? dt.nextElementSibling : null;
    if (!destino) {
      var dato = Array.prototype.find.call(document.querySelectorAll('.dato'), function (x) {
        return x.querySelector('small').textContent.replace('(i)', '').trim() === etiqueta;
      });
      destino = dato ? dato.querySelector('strong') : null;
    }
    if (!destino) return;
    if (html) destino.innerHTML = valor; else destino.textContent = valor;
  }
  function sinFolio(volverA) {
    MC.toast('No se indicó un folio. Regresando a la búsqueda...', 'error');
    MC.ir(volverA, 1200);
  }

  /* ======================================================================
     DEVOLUCIÓN DE COMPRAS
     ====================================================================== */
  if (archivo === 'devolucion-compra-buscar') {
    var formBuscar = document.querySelector('form[data-validar]');
    $('folio').value = MC.param('folio') || '';
    $('folio').placeholder = 'OC-' + new Date().getFullYear() + '-0148';
    formBuscar.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var folio = e.detail.datos.folio.toUpperCase();
      MC.datos.obtener('compras', folio).then(function (c) {
        if (c.estado !== 'Emitida') return MC.toast('La orden ' + c.folio + ' está en estado ' + c.estado + ' y no puede devolverse', 'error');
        if (!c.lineas.some(function (l) { return l.tipo === 'Souvenir'; })) return MC.toast('La orden no contiene souvenirs', 'error');
        MC.toast('Orden encontrada', 'success');
        MC.ir('devolucion-compra-datos.html?folio=' + encodeURIComponent(c.folio), 600);
      }).catch(function () {
        $('folio').setAttribute('aria-invalid', 'true');
        MC.toast('No existe una orden de compra con el folio ' + folio, 'error');
      });
    });
  }

  if (archivo === 'devolucion-compra-datos') {
    var folioCompra = MC.param('folio');
    var compra = null;
    if (!folioCompra) sinFolio('devolucion-compra-buscar.html');
    else MC.datos.obtener('compras', folioCompra).then(function (c) {
      compra = c;
      var souv = c.lineas.filter(function (l) { return l.tipo === 'Souvenir'; });
      var totalSouv = souv.reduce(function (s, l) { return s + l.cantidad * l.precio; }, 0);
      poner('Folio', c.folio);
      poner('Fecha', MC.fechaMx(c.fecha));
      poner('Proveedor', c.proveedor);
      poner('Estado', MC.insigniaEstado(c.estado), true);
      document.querySelector('.tabla-datos tbody').innerHTML = souv.map(function (l) {
        return '<tr><td>' + MC.esc(l.articulo) + '</td><td>' + l.cantidad + '</td><td class="num">' + MC.dinero(l.precio) + '</td><td class="num">' + MC.dinero(l.cantidad * l.precio) + '</td></tr>';
      }).join('');
      document.querySelector('.total-orden').textContent = 'Total de la orden: ' + MC.dinero(totalSouv);
      document.querySelector('#modal-confirmar p').innerHTML = 'La orden ' + MC.esc(c.folio) + ' cambiará a estado <strong>Devuelta</strong> y la transacción será registrada.';
      if (c.estado !== 'Emitida') {
        document.querySelector('[data-modal-abrir="modal-confirmar"]').disabled = true;
        MC.toast('Esta orden ya está en estado ' + c.estado, 'info');
      }
    }).catch(function (err) { MC.toast(err.message, 'error'); });

    MC.tomarBoton(document.querySelector('#modal-confirmar .btn-primary'), function () {
      if (!compra || compra.estado !== 'Emitida') return;
      var souv = compra.lineas.filter(function (l) { return l.tipo === 'Souvenir'; });
      var totalDev = souv.reduce(function (s, l) { return s + l.cantidad * l.precio; }, 0);
      /* Salida del inventario de los souvenirs devueltos al proveedor */
      Promise.all(souv.map(function (l) {
        return MC.datos.obtener('souvenirs', l.folio).then(function (s) {
          return MC.datos.actualizar('souvenirs', s.folio, { existencia: Math.max(0, (Number(s.existencia) || 0) - l.cantidad) });
        }).catch(function () { return null; });
      })).then(function () {
        return MC.datos.actualizar('compras', compra.folio, { estado: 'Devuelta' });
      }).then(function () {
        return MC.datos.crear('devoluciones', {
          tipo: 'compra', compra: compra.folio, proveedor: compra.proveedor, fecha: MC.ahoraMx(), total: totalDev,
          estado: 'Devuelta', registro_por: sesion ? sesion.nombre : ''
        });
      }).then(function (d) {
        MC.toast('Devolución registrada', 'success');
        MC.ir('devolucion-compra-completada.html?folio=' + encodeURIComponent(d.folio), 700);
      });
    });
  }

  if (archivo === 'devolucion-compra-completada') {
    var folioDev = MC.param('folio');
    if (!folioDev) sinFolio('devolucion-compra-buscar.html');
    else MC.datos.obtener('devoluciones', folioDev).then(function (d) {
      poner('Folio', d.compra);
      poner('Folio de devolución', d.folio);
      poner('Fecha y hora', d.fecha);
      poner('Total devuelto', MC.dinero(d.total));
    }).catch(function (err) { MC.toast(err.message, 'error'); });
  }

  /* ======================================================================
     DEVOLUCIÓN DE VENTAS
     ====================================================================== */
  if (archivo === 'devolucion-venta-buscar') {
    var formVenta = document.querySelector('form[data-validar]');
    var ticket = null;
    var campoTicket = $('folio-ticket');
    var limpiar = ['fecha-venta', 'estado-ticket', 'vendedor', 'metodo-pago', 'souvenir', 'cantidad', 'precio-unitario', 'subtotal', 'iva', 'monto-a-reembolsar', 'observaciones'];
    var vaciar = function () { limpiar.forEach(function (k) { $(k).value = ''; }); ticket = null; };

    var buscarTicket = function () {
      var folio = campoTicket.value.trim();
      if (!folio) { campoTicket.setAttribute('aria-invalid', 'true'); return MC.toast('Escribe el folio del ticket', 'error'); }
      MC.datos.obtener('ventas', folio).then(function (v) {
        ticket = v;
        var total = Number(v.total);
        MC.llenarForm(formVenta, {
          'fecha-venta': MC.fechaMx(v.fecha.slice(0, 10)) + ' ' + v.fecha.slice(11), 'estado-ticket': v.estado, vendedor: v.vendedor,
          'metodo-pago': v.metodo, souvenir: v.souvenir, cantidad: v.cantidad, 'precio-unitario': Number(v.precio).toFixed(2),
          subtotal: (total / (1 + IVA)).toFixed(2), iva: (total - total / (1 + IVA)).toFixed(2), 'monto-a-reembolsar': total.toFixed(2),
          observaciones: v.observaciones || 'Sin observaciones'
        });
        if (v.estado !== 'Pagado') MC.toast('El ticket está en estado ' + v.estado + ' y no admite devolución', 'error');
        else MC.toast('Ticket encontrado', 'success');
      }).catch(function () {
        vaciar();
        campoTicket.setAttribute('aria-invalid', 'true');
        MC.toast('No existe un ticket con el folio ' + folio, 'error');
      });
    };
    vaciar();
    campoTicket.value = MC.param('ticket') || '';
    if (campoTicket.value) buscarTicket();
    MC.tomarBoton(formVenta.querySelector('.buscar-clave button'), buscarTicket);
    campoTicket.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); buscarTicket(); } });

    formVenta.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      if (!ticket || ticket.folio !== campoTicket.value.trim()) return MC.toast('Busca primero el ticket', 'error');
      if (ticket.estado !== 'Pagado') return MC.toast('El ticket no admite devolución', 'error');
      MC.datos.buscar('devoluciones', function (d) { return d.venta === ticket.folio && d.estado === 'Pendiente'; }).then(function (pend) {
        if (pend) {
          MC.toast('Ese ticket ya tiene una solicitud pendiente', 'info');
          return MC.ir('devolucion-venta-autorizar.html?folio=' + encodeURIComponent(pend.folio), 900);
        }
        return MC.datos.crear('devoluciones', {
          tipo: 'venta', venta: ticket.folio, fechaVenta: ticket.fecha, cliente: ticket.cliente, souvenir: ticket.souvenir,
          souvenirFolio: ticket.souvenirFolio, cantidad: ticket.cantidad, motivo: e.detail.datos.motivo, total: Number(ticket.total),
          forma: ticket.metodo === 'Efectivo' ? 'Efectivo' : 'Tarjeta (misma de la venta)', estado: 'Pendiente',
          solicito: sesion ? sesion.nombre : '', fecha: MC.ahoraMx()
        }).then(function (d) {
          MC.toast('Solicitud de devolución ' + d.folio + ' enviada a autorización', 'success');
          MC.ir('devolucion-venta-autorizar.html?folio=' + encodeURIComponent(d.folio), 900);
        });
      });
    });
  }

  /* Datos comunes de autorizar / autorizada / rechazada */
  function pintarSolicitud(d) {
    poner('Folio de devolución', d.folio);
    poner('Folio de venta original', d.venta);
    poner('Cliente', d.cliente);
    poner('Souvenir y cantidad', d.souvenir + ' × ' + d.cantidad);
    poner('Motivo de la devolución', d.motivo);
    poner('Fecha de venta', MC.fechaMx(String(d.fechaVenta).slice(0, 10)));
    poner('Monto a reembolsar', MC.dinero(d.total) + ' MXN');
    poner('Forma de reembolso', d.forma);
    poner('Estado actual', MC.insigniaEstado(d.estado), true);
  }

  if (archivo === 'devolucion-venta-autorizar') {
    var folioSol = MC.param('folio');
    var solicitud = null;
    var obs = $('observaciones-dictamen');
    if (!folioSol) sinFolio('devolucion-venta-buscar.html');
    else MC.datos.obtener('devoluciones', folioSol).then(function (d) {
      solicitud = d;
      pintarSolicitud(d);
      poner('Estado del souvenir', 'Bueno · se reintegra al inventario');
      poner('Autorizado por', sesion ? sesion.nombre + ' · ' + sesion.rol : '—');
      if (d.estado !== 'Pendiente') {
        MC.toast('Esta solicitud ya fue ' + d.estado.toLowerCase(), 'info');
        MC.ir('devolucion-venta-' + (d.estado === 'Autorizada' ? 'autorizada' : 'rechazada') + '.html?folio=' + encodeURIComponent(d.folio), 1200);
      }
    }).catch(function (err) { MC.toast(err.message, 'error'); });

    var dictaminar = function (autorizar) {
      if (!solicitud || solicitud.estado !== 'Pendiente') return;
      if (!autorizar && !obs.value.trim()) {
        obs.setAttribute('aria-invalid', 'true');
        obs.focus();
        return MC.toast('Las observaciones son obligatorias al rechazar', 'error');
      }
      var cambios = { estado: autorizar ? 'Autorizada' : 'Rechazada', dictamen: obs.value.trim(), dictamino: sesion ? sesion.nombre + ' · ' + sesion.rol : '', fechaDictamen: MC.ahoraMx() };
      var pasos = MC.datos.actualizar('devoluciones', solicitud.folio, cambios);
      if (autorizar) {
        /* Reintegro al inventario y ticket marcado como devuelto */
        pasos = pasos.then(function () {
          return MC.datos.actualizar('ventas', solicitud.venta, { estado: 'Devuelto' });
        }).then(function () {
          return MC.datos.obtener('souvenirs', solicitud.souvenirFolio).then(function (s) {
            return MC.datos.actualizar('souvenirs', s.folio, { existencia: (Number(s.existencia) || 0) + Number(solicitud.cantidad) });
          }).catch(function () { return null; });
        });
      }
      pasos.then(function () {
        MC.toast(autorizar ? 'Devolución autorizada' : 'Devolución rechazada', autorizar ? 'success' : 'info');
        MC.ir('devolucion-venta-' + (autorizar ? 'autorizada' : 'rechazada') + '.html?folio=' + encodeURIComponent(solicitud.folio), 800);
      });
    };
    MC.tomarBoton(document.querySelector('.acciones [data-ir="devolucion-venta-autorizada.html"]'), function () { dictaminar(true); });
    var rechazar = $('btn-rechazar');
    if (rechazar) {
      rechazar.removeAttribute('data-destino');
      rechazar.addEventListener('click', function () { dictaminar(false); });
    }
    obs.addEventListener('input', function () { if (obs.value.trim()) obs.removeAttribute('aria-invalid'); });
  }

  if (archivo === 'devolucion-venta-autorizada' || archivo === 'devolucion-venta-rechazada') {
    var folioRes = MC.param('folio');
    if (!folioRes) sinFolio('devolucion-venta-buscar.html');
    else MC.datos.obtener('devoluciones', folioRes).then(function (d) {
      pintarSolicitud(d);
      poner(archivo === 'devolucion-venta-autorizada' ? 'Autorizado por' : 'Rechazado por', d.dictamino || '—');
      if (d.dictamen && archivo === 'devolucion-venta-rechazada') poner('Reintegro a inventario', 'No · ' + d.dictamen);
    }).catch(function (err) { MC.toast(err.message, 'error'); });
  }
})();
