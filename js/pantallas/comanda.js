/**
 * comanda.js - Mesas y crear comanda (rol Mesero). Requiere comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;

  /* Selección de mesa */
  var mesaSel = document.getElementById('mesa-seleccionada');
  document.querySelectorAll('.mesa:not(.ocupada)').forEach(function (m) {
    m.addEventListener('click', function () {
      document.querySelectorAll('.mesa').forEach(function (x) { x.classList.remove('seleccionada'); });
      m.classList.add('seleccionada');
      if (mesaSel) mesaSel.textContent = m.textContent.trim();
      var go = document.getElementById('btn-abrir-mesa');
      if (go) go.disabled = false;
    });
  });

  /* Crear comanda */
  var cuerpo = document.getElementById('lineas-comanda');
  if (!cuerpo) return;
  var total = document.getElementById('total-comanda');
  var PLATILLOS = {
    'Bebidas': [['Refresco', 40], ['Agua mineral', 35], ['Limonada', 45]],
    'Mar y Tierra': [['Mar y Tierra', 189]],
    'Pastas': [['Spaghetti boloñesa', 120]],
    'Pizzas': [['Pizza margarita', 150]],
    'Sopas': [['Sopa de tortilla', 85]],
    'Croisssants': [['Croissant jamón y queso', 75]],
    'Molletes': [['Mollete clásico', 65]],
    'Tapas': [['Tapas variadas', 110]],
    'Crepas': [['Crepa de cajeta', 70]],
    'Paninos': [['Panino de Milanesa', 92]],
    'Cafe': [['Café americano', 38]],
    'Cocteleria': [['Margarita', 95]]
  };
  var lineas = [{ nombre: 'Panino de Milanesa', precio: 92, cantidad: 1 }, { nombre: 'Refresco', precio: 40, cantidad: 1 }];

  function pintar() {
    var suma = 0;
    cuerpo.innerHTML = lineas.length ? lineas.map(function (l, i) {
      suma += l.precio * l.cantidad;
      return '<tr><td>' + MC.dinero(l.precio) + '</td><td>' + l.cantidad + '</td><td class="nombre">' + l.nombre +
        '</td><td><button type="button" class="borrar" data-i="' + i + '" aria-label="Eliminar"><i class="fa-solid fa-trash-can"></i></button></td></tr>';
    }).join('') : '<tr class="sin-lineas"><td colspan="4">Selecciona una categoría para agregar alimentos</td></tr>';
    total.textContent = MC.dinero(suma);
  }

  document.querySelectorAll('.categoria').forEach(function (c) {
    c.addEventListener('click', function () {
      var lista = PLATILLOS[c.textContent.trim()] || [];
      var elegido = lista[0];
      if (!elegido) return;
      var existente = lineas.find(function (l) { return l.nombre === elegido[0]; });
      if (existente) existente.cantidad++; else lineas.push({ nombre: elegido[0], precio: elegido[1], cantidad: 1 });
      MC.toast(elegido[0] + ' agregado', 'success');
      pintar();
    });
  });

  cuerpo.addEventListener('click', function (e) {
    var b = e.target.closest('.borrar');
    if (!b) return;
    lineas.splice(Number(b.dataset.i), 1);
    pintar();
  });

  document.getElementById('btn-confirmar-comanda').addEventListener('click', function () {
    if (!lineas.length) return MC.toast('Agrega al menos un alimento', 'error');
    MC.toast('Comanda enviada a cocina', 'success');
  });
  pintar();
})();
