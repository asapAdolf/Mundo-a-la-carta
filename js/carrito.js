/**
 * carrito.js - Estado del carrito compartido entre carta, carrito y checkout.
 * Persistido en localStorage. Expone MC.carrito.
 */
(function () {
  'use strict';
  var MC = (window.MC = window.MC || {});
  var CLAVE = 'mc_carrito';
  var SERVICIO = 2.5;
  var IVA = 0.08;

  function leer() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE));
      if (Array.isArray(datos)) return datos;
    } catch (err) { /* sin datos válidos */ }
    return null;
  }

  MC.carrito = {
    items: function () {
      return leer() || [];
    },
    guardar: function (items) { localStorage.setItem(CLAVE, JSON.stringify(items)); },
    vaciar: function () { this.guardar([]); },
    cambiar: function (producto, cantidad) {
      var items = this.items().filter(function (i) { return i.id !== producto.id; });
      if (cantidad > 0) items.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: cantidad });
      this.guardar(items);
    },
    cantidad: function (id) {
      var it = this.items().find(function (i) { return i.id === id; });
      return it ? it.cantidad : 0;
    },
    totales: function () {
      var items = this.items();
      var subtotal = items.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
      var servicio = items.length ? SERVICIO : 0;
      var iva = Math.round((subtotal + servicio) * IVA * 100) / 100;
      return {
        piezas: items.reduce(function (s, i) { return s + i.cantidad; }, 0),
        subtotal: subtotal, servicio: servicio, iva: iva, total: subtotal + servicio + iva
      };
    }
  };

  /* Pinta [data-render="lineas|totales|total|piezas"] en carrito y checkout */
  document.addEventListener('DOMContentLoaded', function () {
    var c = MC.carrito;
    var t = c.totales();
    document.querySelectorAll('[data-render="lineas"]').forEach(function (el) {
      var items = c.items();
      el.innerHTML = items.length ? items.map(function (i) {
        return '<li><span>' + i.cantidad + 'x ' + i.nombre + '<small>' + MC.dinero(i.precio) + ' c/u</small></span>' +
          '<span>' + MC.dinero(i.precio * i.cantidad) + '</span></li>';
      }).join('') : '<li>Tu carrito está vacío</li>';
    });
    var mapa = { subtotal: t.subtotal, servicio: t.servicio, iva: t.iva, total: t.total };
    Object.keys(mapa).forEach(function (k) {
      document.querySelectorAll('[data-render="' + k + '"]').forEach(function (el) { el.textContent = MC.dinero(mapa[k]); });
    });
    document.querySelectorAll('[data-render="piezas"]').forEach(function (el) { el.textContent = t.piezas; });
  });
})();
