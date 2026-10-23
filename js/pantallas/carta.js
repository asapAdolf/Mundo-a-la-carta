/**
 * carta.js - Pantalla de carta: steppers por producto y panel del carrito.
 * Requiere carrito.js y comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var panel = document.getElementById('carrito-panel');
  var lista = document.getElementById('carrito-lista');
  var contador = document.getElementById('carrito-contador');
  var totalEl = document.getElementById('carrito-total');

  function producto(el) {
    return { id: el.dataset.id, nombre: el.dataset.nombre, precio: Number(el.dataset.precio) };
  }

  function pintar() {
    var items = MC.carrito.items();
    var t = MC.carrito.totales();
    contador.textContent = t.piezas;
    totalEl.textContent = MC.dinero(t.subtotal);
    lista.innerHTML = items.length ? items.map(function (i) {
      return '<div class="carrito-linea"><span class="nombre">' + i.nombre + '</span><span>' + i.cantidad + '</span>' +
        '<span>' + MC.dinero(i.precio * i.cantidad) + '<small>' + MC.dinero(i.precio) + ' x ' + i.cantidad + '</small></span></div>';
    }).join('') : '<p class="carrito-vacio">Aún no agregas productos</p>';

    document.querySelectorAll('.producto').forEach(function (el) {
      el.querySelector('.cant').textContent = MC.carrito.cantidad(el.dataset.id);
    });
  }

  document.querySelectorAll('.producto').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var paso = e.target.closest('[data-delta]');
      if (!paso) return;
      var nueva = Math.max(0, MC.carrito.cantidad(el.dataset.id) + Number(paso.dataset.delta));
      MC.carrito.cambiar(producto(el), nueva);
      pintar();
    });
  });

  document.getElementById('carrito-abrir').addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('abierto');
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#carrito-panel, #carrito-abrir')) panel.classList.remove('abierto');
  });

  pintar();
})();
