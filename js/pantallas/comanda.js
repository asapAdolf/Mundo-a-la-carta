/**
 * comanda.js - Mesas, navegación entre Pantalla A (Categorías) y Pantalla B (Menú de Platillos),
 * y persistencia de estado de la comanda (rol Mesero). Requiere comun.js.
 */
(function () {
  'use strict';
  var MC = window.MC;
  var STORAGE_KEY = 'mc_estado_comanda';

  /* =========================================================================
   * 1. ESTRUCTURA DE DATOS CENTRALIZADA (Mock DB en formato JSON)
   * ========================================================================= */
  var MENU_DB = {
    categorias: [
      { id: 'bebidas', nombre: 'Bebidas' },
      { id: 'mar-y-tierra', nombre: 'Mar y Tierra' },
      { id: 'pastas', nombre: 'Pastas' },
      { id: 'pizzas', nombre: 'Pizzas' },
      { id: 'sopas', nombre: 'Sopas' },
      { id: 'croisssants', nombre: 'Croisssants' },
      { id: 'molletes', nombre: 'Molletes' },
      { id: 'tapas', nombre: 'Tapas' },
      { id: 'crepas', nombre: 'Crepas' },
      { id: 'paninos', nombre: 'Paninos' },
      { id: 'cafe', nombre: 'Cafe' },
      { id: 'cocteleria', nombre: 'Cocteleria' }
    ],
    platillos: [
      { id: 'beb-01', categoriaId: 'bebidas', nombre: 'Refresco', precio: 40.00, disponible: true },
      { id: 'beb-02', categoriaId: 'bebidas', nombre: 'Agua mineral', precio: 35.00, disponible: true },
      { id: 'beb-03', categoriaId: 'bebidas', nombre: 'Limonada', precio: 45.00, disponible: true },
      { id: 'beb-04', categoriaId: 'bebidas', nombre: 'Naranjada', precio: 45.00, disponible: true },
      { id: 'beb-05', categoriaId: 'bebidas', nombre: 'Té helado', precio: 42.00, disponible: true },
      { id: 'beb-06', categoriaId: 'bebidas', nombre: 'Jugo natural', precio: 50.00, disponible: true },

      { id: 'myt-01', categoriaId: 'mar-y-tierra', nombre: 'Mar y Tierra', precio: 189.00, disponible: true },
      { id: 'myt-02', categoriaId: 'mar-y-tierra', nombre: 'Filete y Camarones', precio: 215.00, disponible: true },
      { id: 'myt-03', categoriaId: 'mar-y-tierra', nombre: 'Salmón al Grill', precio: 195.00, disponible: true },
      { id: 'myt-04', categoriaId: 'mar-y-tierra', nombre: 'Rib Eye con Langostinos', precio: 245.00, disponible: true },

      { id: 'pas-01', categoriaId: 'pastas', nombre: 'Pasta Pesto', precio: 110.00, disponible: true },
      { id: 'pas-02', categoriaId: 'pastas', nombre: 'Spaghetti boloñesa', precio: 120.00, disponible: true },
      { id: 'pas-03', categoriaId: 'pastas', nombre: 'Fettuccine Alfredo', precio: 115.00, disponible: true },
      { id: 'pas-04', categoriaId: 'pastas', nombre: 'Penne Arrabbiata', precio: 105.00, disponible: true },
      { id: 'pas-05', categoriaId: 'pastas', nombre: 'Ravioles de Ricotta', precio: 130.00, disponible: true },
      { id: 'pas-06', categoriaId: 'pastas', nombre: 'Lasaña clásica', precio: 135.00, disponible: true },

      { id: 'piz-01', categoriaId: 'pizzas', nombre: 'Pizza margarita', precio: 150.00, disponible: true },
      { id: 'piz-02', categoriaId: 'pizzas', nombre: 'Pizza pepperoni', precio: 165.00, disponible: true },
      { id: 'piz-03', categoriaId: 'pizzas', nombre: 'Pizza cuatro quesos', precio: 175.00, disponible: true },
      { id: 'piz-04', categoriaId: 'pizzas', nombre: 'Pizza jamón serrano', precio: 190.00, disponible: true },

      { id: 'sop-01', categoriaId: 'sopas', nombre: 'Sopa de tortilla', precio: 85.00, disponible: true },
      { id: 'sop-02', categoriaId: 'sopas', nombre: 'Crema de champiñones', precio: 90.00, disponible: true },
      { id: 'sop-03', categoriaId: 'sopas', nombre: 'Sopa de cebolla', precio: 95.00, disponible: true },
      { id: 'sop-04', categoriaId: 'sopas', nombre: 'Consomé de la casa', precio: 75.00, disponible: true },

      { id: 'cro-01', categoriaId: 'croisssants', nombre: 'Croissant jamón y queso', precio: 75.00, disponible: true },
      { id: 'cro-02', categoriaId: 'croisssants', nombre: 'Croissant de almendra', precio: 68.00, disponible: true },
      { id: 'cro-03', categoriaId: 'croisssants', nombre: 'Croissant de pavo y brie', precio: 85.00, disponible: true },
      { id: 'cro-04', categoriaId: 'croisssants', nombre: 'Croissant de chocolate', precio: 65.00, disponible: true },

      { id: 'mol-01', categoriaId: 'molletes', nombre: 'Mollete clásico', precio: 65.00, disponible: true },
      { id: 'mol-02', categoriaId: 'molletes', nombre: 'Mollete con chorizo', precio: 80.00, disponible: true },
      { id: 'mol-03', categoriaId: 'molletes', nombre: 'Mollete con tocino', precio: 80.00, disponible: true },
      { id: 'mol-04', categoriaId: 'molletes', nombre: 'Mollete supremo', precio: 95.00, disponible: true },

      { id: 'tap-01', categoriaId: 'tapas', nombre: 'Tapas variadas', precio: 110.00, disponible: true },
      { id: 'tap-02', categoriaId: 'tapas', nombre: 'Tapa de jamón ibérico', precio: 125.00, disponible: true },
      { id: 'tap-03', categoriaId: 'tapas', nombre: 'Patatas bravas', precio: 85.00, disponible: true },
      { id: 'tap-04', categoriaId: 'tapas', nombre: 'Gambas al ajillo', precio: 140.00, disponible: true },

      { id: 'cre-01', categoriaId: 'crepas', nombre: 'Crepa de cajeta', precio: 70.00, disponible: true },
      { id: 'cre-02', categoriaId: 'crepas', nombre: 'Crepa de frutos rojos', precio: 80.00, disponible: true },
      { id: 'cre-03', categoriaId: 'crepas', nombre: 'Crepa de champiñones', precio: 90.00, disponible: true },
      { id: 'cre-04', categoriaId: 'crepas', nombre: 'Crepa de nutella y fresa', precio: 85.00, disponible: true },

      { id: 'pan-01', categoriaId: 'paninos', nombre: 'Panino de Milanesa', precio: 92.00, disponible: true },
      { id: 'pan-02', categoriaId: 'paninos', nombre: 'Panino Caprese', precio: 88.00, disponible: true },
      { id: 'pan-03', categoriaId: 'paninos', nombre: 'Panino de Pollo Pesto', precio: 95.00, disponible: true },
      { id: 'pan-04', categoriaId: 'paninos', nombre: 'Panino Roast Beef', precio: 105.00, disponible: true },

      { id: 'caf-01', categoriaId: 'cafe', nombre: 'Café americano', precio: 38.00, disponible: true },
      { id: 'caf-02', categoriaId: 'cafe', nombre: 'Cappuccino', precio: 48.00, disponible: true },
      { id: 'caf-03', categoriaId: 'cafe', nombre: 'Latte vainilla', precio: 52.00, disponible: true },
      { id: 'caf-04', categoriaId: 'cafe', nombre: 'Espresso doble', precio: 42.00, disponible: true },

      { id: 'coc-01', categoriaId: 'cocteleria', nombre: 'Margarita', precio: 95.00, disponible: true },
      { id: 'coc-02', categoriaId: 'cocteleria', nombre: 'Mojito clásico', precio: 90.00, disponible: true },
      { id: 'coc-03', categoriaId: 'cocteleria', nombre: 'Carajillo', precio: 115.00, disponible: true },
      { id: 'coc-04', categoriaId: 'cocteleria', nombre: 'Piña colada', precio: 95.00, disponible: true }
    ]
  };

  /* =========================================================================
   * 2. CAPA DE ACCESO A DATOS (Preparada para futura Base de Datos / API REST)
   * ========================================================================= */
  var MenuRepository = {
    /**
     * Cuando se implemente el backend con base de datos, basta con cambiar
     * `usarApiRemota: true` y configurar `apiBaseUrl` (ej. '/api/v1/menu').
     */
    config: {
      usarApiRemota: false,
      apiBaseUrl: '/api/menu'
    },

    obtenerCategorias: function () {
      var self = this;
      if (self.config.usarApiRemota) {
        return fetch(self.config.apiBaseUrl + '/categorias')
          .then(function (res) {
            if (!res.ok) throw new Error('Error al consultar categorías en BD');
            return res.json();
          });
      }
      return Promise.resolve(MENU_DB.categorias);
    },

    /**
     * Obtiene la categoría y sus platillos a partir del ID o nombre recibido por parámetro.
     * En la futura BD equivaldrá a: GET /api/menu/categorias/:parametro/platillos
     */
    obtenerPlatillosPorCategoria: function (parametroCategoria) {
      var self = this;
      var criterio = String(parametroCategoria || '').trim().toLowerCase();

      if (self.config.usarApiRemota) {
        return fetch(self.config.apiBaseUrl + '/categorias/' + encodeURIComponent(criterio) + '/platillos')
          .then(function (res) {
            if (!res.ok) throw new Error('Error al consultar platillos en BD');
            return res.json();
          });
      }

      var categoria = MENU_DB.categorias.find(function (c) {
        return c.id.toLowerCase() === criterio || c.nombre.toLowerCase() === criterio;
      });
      if (!categoria) {
        return Promise.resolve({ categoria: null, platillos: [] });
      }

      var platillos = MENU_DB.platillos.filter(function (p) {
        return p.categoriaId === categoria.id && p.disponible !== false;
      });
      return Promise.resolve({ categoria: categoria, platillos: platillos });
    }
  };

  /* =========================================================================
   * 3. MANEJO DE ESTADO Y PERSISTENCIA (Comanda, Mesa y Mesero)
   * ========================================================================= */
  var LINEAS_INICIALES = [
    { id: 'pan-01', nombre: 'Panino de Milanesa', precio: 92, cantidad: 1 },
    { id: 'beb-01', nombre: 'Refresco', precio: 40, cantidad: 1 }
  ];

  function leerEstado() {
    try {
      var guardado = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (guardado && Array.isArray(guardado.lineas)) return guardado;
    } catch (e) { /* usar estado por defecto */ }
    return {
      mesero: 'Juan Pérez',
      mesa: 'A3',
      lineas: LINEAS_INICIALES.slice(),
      ultimaCategoria: null
    };
  }

  function guardarEstado(estado) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch (e) { /* ignorar si sessionStorage está restringido */ }
  }

  var estado = leerEstado();

  /* =========================================================================
   * 4. PANTALLA DE SELECCIÓN DE MESAS (mesas.html)
   * ========================================================================= */
  var mesaSel = document.getElementById('mesa-seleccionada');
  document.querySelectorAll('.mesa:not(.ocupada)').forEach(function (m) {
    m.addEventListener('click', function () {
      document.querySelectorAll('.mesa').forEach(function (x) { x.classList.remove('seleccionada'); });
      m.classList.add('seleccionada');
      var codigoMesa = m.textContent.trim();
      if (mesaSel) mesaSel.textContent = codigoMesa;
      estado.mesa = codigoMesa;
      guardarEstado(estado);
      var go = document.getElementById('btn-abrir-mesa');
      if (go) go.disabled = false;
    });
  });

  /* =========================================================================
   * 5. PANTALLA CREAR COMANDA: PANTALLA A (Categorías) <-> PANTALLA B (Platillos)
   * ========================================================================= */
  var cuerpo = document.getElementById('lineas-comanda');
  if (!cuerpo) return;

  var total = document.getElementById('total-comanda');
  var panelIzq = document.querySelector('.comanda-layout .panel-comanda');
  var tituloCabecera = panelIzq ? panelIzq.querySelector('.panel-comanda-cab > span:first-child') : null;
  var botonesCabecera = panelIzq ? panelIzq.querySelectorAll('.panel-comanda-cab button') : [];
  var btnAnterior = botonesCabecera[0] || null;
  var btnSiguiente = botonesCabecera[1] || null;
  var contenedorGrid = panelIzq ? panelIzq.querySelector('.categorias') : null;

  // Sincronizar pie de comanda (Mesero y Mesa) con el estado persistido
  var pieEm = document.querySelectorAll('.comanda-pie span em');
  if (pieEm.length >= 2) {
    if (estado.mesero) pieEm[0].textContent = estado.mesero;
    if (estado.mesa) pieEm[1].textContent = estado.mesa;
  }

  /**
   * Renderiza el panel derecho (tabla de comanda) y el total a pagar.
   * Mantiene su información sin importar los cambios en el panel izquierdo.
   */
  function pintarComanda() {
    var suma = 0;
    cuerpo.innerHTML = estado.lineas.length ? estado.lineas.map(function (l, i) {
      suma += l.precio * l.cantidad;
      return '<tr><td>' + MC.dinero(l.precio) + '</td><td>' + l.cantidad + '</td><td class="nombre">' + l.nombre +
        '</td><td><button type="button" class="borrar" data-i="' + i + '" aria-label="Eliminar"><i class="fa-solid fa-trash-can"></i></button></td></tr>';
    }).join('') : '<tr class="sin-lineas"><td colspan="4">Selecciona una categoría para agregar alimentos</td></tr>';
    if (total) total.textContent = MC.dinero(suma);
  }

  /**
   * Lee o actualiza el parámetro `?categoria=` en la URL para paso de parámetros
   * entre Pantalla A y Pantalla B sin recargar ni perder el layout.
   */
  function obtenerParametroCategoriaURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('categoria');
  }

  function actualizarParametroURL(categoriaId, reemplazar) {
    if (!window.history || !window.history.pushState) return;
    var url = new URL(window.location.href);
    if (categoriaId) {
      url.searchParams.set('categoria', categoriaId);
    } else {
      url.searchParams.delete('categoria');
    }
    var metodo = reemplazar ? 'replaceState' : 'pushState';
    window.history[metodo]({ categoria: categoriaId || null }, '', url.toString());
  }

  /**
   * PANTALLA A: Renderiza la vista de 'Opciones de alimentos' (Grid de Categorías)
   */
  function renderizarPantallaCategorias(reemplazarHistorial) {
    if (!contenedorGrid || !tituloCabecera) return;

    actualizarParametroURL(null, reemplazarHistorial);
    tituloCabecera.textContent = 'Opciones de alimentos';

    if (btnAnterior) {
      btnAnterior.disabled = true;
      btnAnterior.title = 'Estás en el menú principal de categorías';
    }
    if (btnSiguiente) {
      btnSiguiente.disabled = !estado.ultimaCategoria;
      btnSiguiente.title = estado.ultimaCategoria ? 'Ir a la última categoría seleccionada' : '';
    }

    MenuRepository.obtenerCategorias().then(function (categorias) {
      contenedorGrid.innerHTML = categorias.map(function (cat) {
        return '<button type="button" class="categoria" data-categoria-id="' + cat.id + '" data-categoria-nombre="' + cat.nombre + '">' +
          cat.nombre + '</button>';
      }).join('');
    });
  }

  /**
   * PANTALLA B: Recibe el parámetro (ID o nombre de categoría), actualiza el título
   * y renderiza dinámicamente los platillos con su nombre y precio desde el repositorio.
   */
  function renderizarPantallaPlatillos(parametroCategoria, reemplazarHistorial) {
    if (!contenedorGrid || !tituloCabecera) return;

    MenuRepository.obtenerPlatillosPorCategoria(parametroCategoria).then(function (resultado) {
      if (!resultado.categoria) {
        MC.toast('Categoría no encontrada', 'error');
        renderizarPantallaCategorias(true);
        return;
      }

      var cat = resultado.categoria;
      var platillos = resultado.platillos;

      estado.ultimaCategoria = cat.id;
      guardarEstado(estado);
      actualizarParametroURL(cat.id, reemplazarHistorial);

      // Actualizar encabezado del panel izquierdo con el nombre de la categoría elegida
      tituloCabecera.textContent = cat.nombre;

      if (btnAnterior) {
        btnAnterior.disabled = false;
        btnAnterior.title = 'Volver a Opciones de alimentos';
      }
      if (btnSiguiente) {
        btnSiguiente.disabled = true;
      }

      // Renderizar dinámicamente los botones de cada platillo (Nombre + Precio)
      if (!platillos.length) {
        contenedorGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#6b7280;padding:1.5rem 0">No hay platillos disponibles en esta categoría.</p>';
        return;
      }

      contenedorGrid.innerHTML = platillos.map(function (p) {
        return '<button type="button" class="platillo-btn" ' +
          'data-platillo-id="' + p.id + '" ' +
          'data-platillo-nombre="' + p.nombre + '" ' +
          'data-platillo-precio="' + p.precio + '">' +
          '<span class="platillo-nombre">' + p.nombre + '</span>' +
          '<span class="platillo-precio">' + MC.dinero(p.precio) + '</span>' +
          '</button>';
      }).join('');
    });
  }

  /**
   * Agrega un platillo seleccionado en la Pantalla B a la comanda activa.
   */
  function agregarPlatilloAComanda(platillo) {
    var existente = estado.lineas.find(function (l) {
      return (platillo.id && l.id === platillo.id) || l.nombre === platillo.nombre;
    });
    if (existente) {
      existente.cantidad++;
    } else {
      estado.lineas.push({
        id: platillo.id,
        nombre: platillo.nombre,
        precio: Number(platillo.precio),
        cantidad: 1
      });
    }
    guardarEstado(estado);
    MC.toast(platillo.nombre + ' agregado', 'success');
    pintarComanda();
  }

  /* =========================================================================
   * 6. EVENTOS DE NAVEGACIÓN Y ACCIONES DEL USUARIO
   * ========================================================================= */
  if (contenedorGrid) {
    contenedorGrid.addEventListener('click', function (e) {
      // Caso 1 (Pantalla A -> Pantalla B): Clic en un botón de categoría
      var btnCat = e.target.closest('.categoria');
      if (btnCat) {
        var paramCategoria = btnCat.getAttribute('data-categoria-id') || btnCat.textContent.trim();
        renderizarPantallaPlatillos(paramCategoria, false);
        return;
      }

      // Caso 2 (Pantalla B): Clic en un botón de platillo para agregarlo a la comanda
      var btnPlatillo = e.target.closest('.platillo-btn');
      if (btnPlatillo) {
        agregarPlatilloAComanda({
          id: btnPlatillo.getAttribute('data-platillo-id'),
          nombre: btnPlatillo.getAttribute('data-platillo-nombre'),
          precio: Number(btnPlatillo.getAttribute('data-platillo-precio'))
        });
      }
    });
  }

  // Botón '<' (Anterior) en la cabecera del panel izquierdo: regresa a Pantalla A (Categorías)
  if (btnAnterior) {
    btnAnterior.addEventListener('click', function () {
      renderizarPantallaCategorias(false);
    });
  }

  // Botón '>' (Siguiente) en la cabecera del panel izquierdo: reabre la última categoría visitada
  if (btnSiguiente) {
    btnSiguiente.addEventListener('click', function () {
      if (estado.ultimaCategoria) {
        renderizarPantallaPlatillos(estado.ultimaCategoria, false);
      }
    });
  }

  // Soporte para botones Atrás / Adelante del navegador
  window.addEventListener('popstate', function () {
    var catParam = obtenerParametroCategoriaURL();
    if (catParam) {
      renderizarPantallaPlatillos(catParam, true);
    } else {
      renderizarPantallaCategorias(true);
    }
  });

  // Eliminar línea de la comanda
  cuerpo.addEventListener('click', function (e) {
    var b = e.target.closest('.borrar');
    if (!b) return;
    estado.lineas.splice(Number(b.dataset.i), 1);
    guardarEstado(estado);
    pintarComanda();
  });

  // Confirmar comanda
  var btnConfirmar = document.getElementById('btn-confirmar-comanda');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      if (!estado.lineas.length) return MC.toast('Agrega al menos un alimento', 'error');
      MC.toast('Comanda enviada a cocina', 'success');
    });
  }

  // Inicialización: pintar comanda y verificar si se recibió `?categoria=` por URL
  pintarComanda();
  var categoriaInicial = obtenerParametroCategoriaURL();
  if (categoriaInicial) {
    renderizarPantallaPlatillos(categoriaInicial, true);
  } else {
    renderizarPantallaCategorias(true);
  }
})();
