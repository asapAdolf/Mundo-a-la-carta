/**
 * cobro.js - Flujo de cobro: carrito → checkout → pago, venta de souvenirs y
 * cobro de comandas. Requiere datos.js, comun.js y (según la pantalla) carrito.js / pagos.js.
 *
 * El "contexto de cobro" (MC.temporal 'cobro') indica qué se está pagando:
 *   { origen: 'pedido' | 'venta' | 'comanda', total, ... , siguiente: url al terminar }
 */
(function () {
  'use strict';
  var MC = window.MC;
  var archivo = (window.location.pathname.split('/').pop() || '').replace('.html', '');
  var $ = function (id) { return document.getElementById(id); };
  var num = function (v) { return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0; };
  var sesion = MC.sesion.actual();

  /* Registra lo que se pagó según el origen del cobro */
  function finalizar(ctx, metodo) {
    if (ctx.origen === 'pedido') {
      var t = MC.carrito.totales();
      return MC.datos.crear('pedidos', {
        fecha: MC.ahoraMx(), cliente: sesion ? sesion.nombre : '', clienteFolio: sesion ? sesion.folio : null,
        items: MC.carrito.items(), entrega: MC.temporal.leer('entrega') || 'Experiencia Virtual',
        subtotal: t.subtotal, servicio: t.servicio, iva: t.iva, total: t.total, metodo: metodo, estado: 'Pagado'
      }).then(function (p) {
        MC.carrito.vaciar();
        MC.temporal.borrar('entrega');
        return 'Pago procesado correctamente. Pedido ' + p.folio;
      });
    }
    if (ctx.origen === 'venta') {
      var v = ctx.venta;
      return MC.datos.obtener('souvenirs', v.souvenirFolio).then(function (s) {
        if (Number(s.existencia) < v.cantidad) throw new Error('Solo hay ' + s.existencia + ' piezas de ' + s.nombre);
        return MC.datos.actualizar('souvenirs', s.folio, { existencia: Number(s.existencia) - v.cantidad });
      }).then(function () {
        return MC.datos.crear('ventas', {
          fecha: MC.hoy() + ' ' + MC.ahoraMx().slice(-5), cliente: v.cliente, souvenir: v.souvenir, souvenirFolio: v.souvenirFolio,
          cantidad: v.cantidad, precio: v.precio, total: v.total, metodo: metodo, vendedor: sesion ? sesion.nombre : '',
          estado: 'Pagado', observaciones: 'Sin observaciones'
        });
      }).then(function (venta) { return 'Venta registrada. Folio del ticket: ' + venta.folio; });
    }
    if (ctx.origen === 'comanda') {
      return MC.datos.actualizar('comandas', ctx.comanda, { estado: 'Pagada', metodo: metodo, pagada: MC.ahoraMx() }).then(function (c) {
        return MC.datos.actualizar('mesas', c.mesa, { estado: 'Libre', comanda: null }).then(function () {
          return 'Comanda ' + c.folio + ' pagada. Mesa ' + c.mesa + ' liberada';
        });
      });
    }
    return Promise.resolve('Pago registrado');
  }

  /* ---------- Carrito ---------- */
  if (archivo === 'carrito') {
    var entrega = $('entrega');
    if (entrega) {
      var previa = MC.temporal.leer('entrega');
      if (previa) entrega.value = previa;
      MC.temporal.guardar('entrega', entrega.value);
      entrega.addEventListener('change', function () { MC.temporal.guardar('entrega', entrega.value); });
    }
    MC.tomarBoton(document.querySelector('.btn-pagar'), function () {
      if (!MC.carrito.items().length) return MC.toast('Tu carrito está vacío. Agrega productos desde la carta', 'error');
      if (entrega && !entrega.value) { entrega.setAttribute('aria-invalid', 'true'); return MC.toast('Selecciona el método de entrega', 'error'); }
      MC.ir('checkout.html');
    });
  }

  /* ---------- Checkout ---------- */
  if (archivo === 'checkout') {
    if (!MC.carrito.items().length) MC.toast('Tu carrito está vacío', 'info');
    var metodoActual = function () {
      var sel = document.querySelector('.metodo.seleccionado');
      return sel ? sel.getAttribute('data-metodo') : 'Tarjeta';
    };
    MC.tomarBoton(document.querySelector('.resumen-caja .btn-pagar'), function () {
      if (!MC.carrito.items().length) return MC.toast('Tu carrito está vacío. Agrega productos desde la carta', 'error');
      finalizar({ origen: 'pedido' }, metodoActual()).then(function (msg) {
        MC.toast(msg, 'success');
        MC.ir('carta.html', 1200);
      });
    });
    MC.tomarBoton(document.querySelector('.metodo-nuevo'), function () {
      if (!MC.carrito.items().length) return MC.toast('Tu carrito está vacío', 'error');
      MC.temporal.guardar('cobro', { origen: 'pedido', total: MC.carrito.totales().total, siguiente: '../carta/carta.html', regreso: '../carta/checkout.html' });
      MC.ir('../ventas/cobro-tarjeta.html');
    });
  }

  /* ---------- Vender souvenirs ---------- */
  if (archivo === 'vender-souvenir') {
    var sel = $('souvenir');
    MC.datos.listar('souvenirs', { filtro: { estado: 'Activo' }, orden: function (a, b) { return a.nombre.localeCompare(b.nombre); } }).then(function (res) {
      sel.innerHTML = '<option value="" data-precio="0">Seleccione souvenir</option>' + res.items.map(function (s) {
        return '<option value="' + MC.esc(s.folio) + '" data-precio="' + MC.esc(s['precio-por-unidad']) + '" data-existencia="' + MC.esc(s.existencia) + '"' +
          (Number(s.existencia) > 0 ? '' : ' disabled') + '>' + MC.esc(s.nombre) + (Number(s.existencia) > 0 ? ' (' + s.existencia + ' disp.)' : ' (agotado)') + '</option>';
      }).join('');
      sel.dispatchEvent(new Event('change'));
    });

    var irACobro = function (pagina) {
      var cliente = $('cliente').value.trim();
      var op = sel.options[sel.selectedIndex];
      var cantidad = parseInt($('cantidad').value, 10) || 0;
      if (!cliente) { $('cliente').setAttribute('aria-invalid', 'true'); return MC.toast('Captura el nombre del cliente', 'error'); }
      if (!sel.value) { sel.setAttribute('aria-invalid', 'true'); return MC.toast('Selecciona un souvenir', 'error'); }
      if (cantidad < 1) { $('cantidad').setAttribute('aria-invalid', 'true'); return MC.toast('La cantidad debe ser mayor a 0', 'error'); }
      if (cantidad > Number(op.getAttribute('data-existencia'))) return MC.toast('Solo hay ' + op.getAttribute('data-existencia') + ' piezas disponibles', 'error');
      var precio = num(op.getAttribute('data-precio'));
      MC.temporal.guardar('cobro', {
        origen: 'venta', total: precio * cantidad, recibido: num($('monto-recibido').value),
        venta: { cliente: cliente, souvenir: op.textContent.replace(/\s\(.*\)$/, ''), souvenirFolio: sel.value, cantidad: cantidad, precio: precio, total: precio * cantidad },
        siguiente: 'vender-souvenir.html', regreso: 'vender-souvenir.html'
      });
      MC.ir(pagina);
    };
    MC.tomarBoton(document.querySelector('[data-ir="cobro-efectivo.html"]'), function () { irACobro('cobro-efectivo.html'); });
    MC.tomarBoton(document.querySelector('[data-ir="cobro-tarjeta.html"]'), function () { irACobro('cobro-tarjeta.html'); });
  }

  /* ---------- Cobro en efectivo / con tarjeta ---------- */
  if (archivo === 'cobro-efectivo' || archivo === 'cobro-tarjeta') {
    var ctx = MC.temporal.leer('cobro');
    var form = document.querySelector('form.tarjeta-pantalla');
    var total = $('total-pagar');
    if (ctx) {
      total.value = Number(ctx.total).toFixed(2);
      total.readOnly = true;
      if ($('monto-recibido') && ctx.recibido) $('monto-recibido').value = Number(ctx.recibido).toFixed(2);
      total.dispatchEvent(new Event('input', { bubbles: true }));
      var regresar = form.querySelector('[data-ir="back"]');
      if (regresar && ctx.regreso) regresar.setAttribute('data-ir', ctx.regreso);
      if (sesion && $('titular') && !$('titular').value) $('titular').value = sesion.nombre;
    }

    form.addEventListener('mc:enviar', function (e) {
      e.preventDefault();
      var d = e.detail.datos;
      var metodo = 'Efectivo';
      if (num(d['total-pagar']) <= 0) return MC.toast('El total a pagar debe ser mayor a 0', 'error');
      if (archivo === 'cobro-efectivo' && num(d['monto-recibido']) < num(d['total-pagar'])) return MC.toast('El monto recibido no cubre el total', 'error');
      if (archivo === 'cobro-tarjeta') {
        var digitos = d['numero-tarjeta'].replace(/\D/g, '');
        var venc = d.vencimiento.split('/');
        var fin = venc.length === 2 ? new Date(2000 + Number(venc[1]), Number(venc[0]), 0) : null;
        if (digitos.length < 15) { $('numero-tarjeta').setAttribute('aria-invalid', 'true'); return MC.toast('El número de tarjeta debe tener 15 o 16 dígitos', 'error'); }
        if (!fin || Number(venc[0]) < 1 || Number(venc[0]) > 12 || fin < new Date()) { $('vencimiento').setAttribute('aria-invalid', 'true'); return MC.toast('La tarjeta está vencida o la fecha no es válida (MM/AA)', 'error'); }
        if (!/^\d{3,4}$/.test(d.cvv)) { $('cvv').setAttribute('aria-invalid', 'true'); return MC.toast('El CVV debe tener 3 o 4 dígitos', 'error'); }
        metodo = 'Tarjeta ••• ' + digitos.slice(-4);
      }
      var cambio = archivo === 'cobro-efectivo' ? num(d['monto-recibido']) - num(d['total-pagar']) : 0;
      finalizar(ctx || {}, metodo).then(function (msg) {
        MC.temporal.borrar('cobro');
        MC.toast(msg + (cambio > 0 ? ' · Cambio: ' + MC.dinero(cambio) : ''), 'success');
        MC.ir(ctx && ctx.siguiente ? ctx.siguiente : '../catalogo.html', 1500);
      }).catch(function (err) { MC.toast(err.message, 'error'); });
    });
  }
})();
