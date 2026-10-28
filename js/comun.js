/**
 * comun.js - Comportamientos compartidos por todas las pantallas (vistas/*.html)
 * Se controla por atributos data-* para no repetir scripts en cada pantalla:
 *   data-ir="url"            navega al hacer clic (con data-toast opcional antes de navegar)
 *   data-toast="mensaje"     muestra un toast (data-toast-tipo: success | error | info)
 *   data-modal-abrir="id"    abre un .modal-backdrop
 *   data-modal-cerrar        cierra el modal contenedor
 *   form[data-validar]       valida campos [required]; data-exito="msg", data-ir="url"
 *   [data-paso="1|-1"]       botones de un [data-stepper] (input numérico)
 *   [data-previsualizar]     input file que pinta la imagen elegida en su .avatar
 */
(function () {
  'use strict';

  var MC = (window.MC = window.MC || {});

  /* ---------- Utilidades ---------- */
  MC.dinero = function (n) {
    return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  MC.toast = function (mensaje, tipo) {
    tipo = tipo || 'info';
    var cont = document.getElementById('toast-container');
    if (!cont) return;
    var iconos = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + tipo;
    el.setAttribute('role', 'status');
    el.innerHTML = '<i class="fa-solid ' + (iconos[tipo] || iconos.info) + '"></i><span></span>';
    el.querySelector('span').textContent = mensaje;
    cont.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  };

  MC.ir = function (url, retraso) {
    if (!url) return;
    setTimeout(function () {
      if (url === 'back') window.history.back(); else window.location.href = url;
    }, retraso || 0);
  };

  MC.esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* Parámetro de la URL actual (?folio=...) */
  MC.param = function (nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
  };

  /* Ruta relativa desde la página actual hacia una ruta desde la raíz del sitio */
  MC.ruta = function (desdeRaiz) {
    var raiz = document.body.getAttribute('data-raiz') || '.';
    return (raiz === '.' ? '' : raiz + '/') + desdeRaiz;
  };

  /* Datos temporales de un flujo de varias pantallas (borradores, cobros) */
  MC.temporal = {
    leer: function (clave) {
      try { return JSON.parse(sessionStorage.getItem('mc_tmp_' + clave)); } catch (e) { return null; }
    },
    guardar: function (clave, valor) {
      try { sessionStorage.setItem('mc_tmp_' + clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
    },
    borrar: function (clave) {
      try { sessionStorage.removeItem('mc_tmp_' + clave); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* Lee los campos de un formulario como objeto { id: valor } */
  MC.leerForm = function (form) {
    var datos = {};
    form.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (c) {
      if (c.type === 'file' || c.type === 'search') return;
      datos[c.id] = c.type === 'checkbox' ? c.checked : c.value.trim();
    });
    return datos;
  };

  /* Llena los campos de un formulario a partir de un objeto { id: valor } */
  MC.llenarForm = function (form, datos) {
    Object.keys(datos || {}).forEach(function (k) {
      var c = form.querySelector('#' + CSS.escape(k));
      if (!c || c.type === 'file') return;
      var v = datos[k];
      if (c.type === 'checkbox') c.checked = !!v;
      else if (c.tagName === 'SELECT') {
        var op = Array.prototype.find.call(c.options, function (o) { return o.value === String(v) || o.text === String(v); });
        if (!op && v) { op = new Option(v, v); c.add(op); }
        c.value = op ? op.value : '';
      } else c.value = v == null ? '' : v;
      c.removeAttribute('aria-invalid');
    });
  };

  /* Ventana de confirmación con el mismo diseño de los modales de las vistas. Resuelve true/false */
  MC.confirmar = function (titulo, texto, textoAceptar) {
    return new Promise(function (resolver) {
      var m = document.createElement('div');
      m.className = 'modal-backdrop open';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.innerHTML = '<div class="modal-dialog"><h2 style="margin:0 0 .5rem;font-size:1.25rem;font-weight:800"></h2>' +
        '<p style="margin:0 0 1.25rem;color:#4b5563"></p><div class="acciones acciones--fin" style="margin-top:0">' +
        '<button type="button" class="btn-secondary" data-resp="no">Cancelar</button>' +
        '<button type="button" class="btn-primary" data-resp="si"></button></div></div>';
      m.querySelector('h2').textContent = titulo;
      m.querySelector('p').textContent = texto;
      m.querySelector('[data-resp="si"]').textContent = textoAceptar || 'Confirmar';
      function alTeclear(e) { if (e.key === 'Escape') cerrar(false); }
      function cerrar(v) { m.remove(); document.removeEventListener('keydown', alTeclear); resolver(v); }
      document.addEventListener('keydown', alTeclear);
      m.addEventListener('click', function (e) {
        var b = e.target.closest('[data-resp]');
        if (b) cerrar(b.getAttribute('data-resp') === 'si');
        else if (e.target === m) cerrar(false);
      });
      document.body.appendChild(m);
      m.querySelector('[data-resp="si"]').focus();
    });
  };

  /* Quita la navegación automática de un botón para que la pantalla controle su acción */
  MC.tomarBoton = function (boton, alClic) {
    if (!boton) return null;
    ['data-ir', 'data-toast', 'data-toast-tipo', 'data-modal-cerrar'].forEach(function (a) { boton.removeAttribute(a); });
    if (alClic) boton.addEventListener('click', alClic);
    return boton;
  };

  /* ---------- Sesión ---------- */
  var CLAVE_SESION = 'mc_sesion';
  MC.sesion = {
    actual: function () {
      try { return JSON.parse(localStorage.getItem(CLAVE_SESION)); } catch (e) { return null; }
    },
    /* Busca primero en empleados (usuario o correo) y luego en clientes (correo) */
    iniciar: function (identificador, password) {
      var id = String(identificador || '').trim().toLowerCase();
      var coincide = function (r, campos) {
        return campos.some(function (k) { return String(r[k] || '').toLowerCase() === id; }) && r.password === password;
      };
      return MC.datos.buscar('empleados', function (e) { return coincide(e, ['usuario', 'correo']); }).then(function (emp) {
        if (emp) return { tipo: 'empleado', registro: emp };
        return MC.datos.buscar('usuarios', function (u) { return coincide(u, ['correo-electronico']); }).then(function (cli) {
          return cli ? { tipo: 'cliente', registro: cli } : null;
        });
      }).then(function (r) {
        if (!r) throw new Error('Usuario o contraseña incorrectos');
        if (r.registro.estado !== 'Activo') throw new Error('La cuenta está dada de baja o inactiva'); // RN_22
        var s = { tipo: r.tipo, folio: r.registro.folio, nombre: r.registro.nombre, rol: r.registro['rol-puesto'] || 'Cliente' };
        localStorage.setItem(CLAVE_SESION, JSON.stringify(s));
        return s;
      });
    },
    cerrar: function () {
      localStorage.removeItem(CLAVE_SESION);
      MC.ir(MC.ruta('index.html'));
    }
  };

  /* ---------- Áreas del sitio ----------
   * Pública: inicio, acceso, carta y reservaciones del cliente (sin sesión: inicio, acceso y carta).
   * Privada (panel administrativo): el resto de vistas, solo para personal.
   * Ver docs/estructura-sitio.md */
  var ruta = window.location.pathname.replace(/\\/g, '/');
  var SIN_SESION = [/\/index\.html$/, /\/$/, /\/vistas\/auth\//, /\/vistas\/carta\/carta\.html$/];
  var AREA_PUBLICA = SIN_SESION.concat([/\/vistas\/carta\//, /\/vistas\/reservas\/(reservacion-|disponibilidad|recibo-reserva)/, /\/vistas\/ventas\/cobro-/]);
  var coincide = function (lista) { return lista.some(function (r) { return r.test(ruta); }); };
  MC.area = coincide(AREA_PUBLICA) ? 'publica' : 'admin';

  (function protegerPagina() {
    if (coincide(SIN_SESION) || !document.body) return;
    var s = MC.sesion.actual();
    if (!s) {
      var volver = encodeURIComponent(window.location.pathname + window.location.search);
      var login = MC.area === 'publica' ? 'vistas/auth/acceso-login.html' : 'vistas/auth/acceso-personal.html';
      window.location.replace(MC.ruta(login) + '?volver=' + volver);
      return;
    }
    if (s.tipo === 'cliente' && MC.area === 'admin') {
      document.addEventListener('DOMContentLoaded', function () { MC.toast('Esta sección es solo para personal de Mundo a la Carta', 'error'); });
      setTimeout(function () { window.location.replace(MC.ruta('index.html')); }, 1200);
    }
  })();

  /* Contador del carrito en el navbar público */
  MC.actualizarContadorCarrito = function () {
    var n = 0;
    try { (JSON.parse(localStorage.getItem('mc_carrito')) || []).forEach(function (i) { n += i.cantidad; }); } catch (e) { n = 0; }
    document.querySelectorAll('[data-carrito-contador]').forEach(function (el) { el.textContent = n; el.hidden = !n; });
  };

  /* Elementos que dependen de la sesión: nombre, rol, cuenta, permisos por rol y cerrar sesión */
  document.addEventListener('DOMContentLoaded', function () {
    var s = MC.sesion.actual();
    var menu = document.getElementById('menu-hamburguesa');
    if (s && menu) {
      var salir = document.createElement('a');
      salir.href = '#';
      salir.setAttribute('data-cerrar-sesion', '');
      salir.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>Cerrar sesión (' + MC.esc(s.nombre) + ')';
      menu.appendChild(salir);
    }
    document.querySelectorAll('[data-sesion-nombre]').forEach(function (el) { el.textContent = s ? s.nombre : 'Invitado'; });
    document.querySelectorAll('[data-sesion-rol]').forEach(function (el) { el.textContent = s ? s.rol : ''; });
    document.querySelectorAll('[data-roles]').forEach(function (el) {
      el.hidden = !s || s.tipo !== 'empleado' || el.getAttribute('data-roles').split(' ').indexOf(s.rol) === -1;
    });
    document.querySelectorAll('[data-cuenta]').forEach(function (a) {
      if (!s) return;
      a.innerHTML = '<i class="fa-solid fa-circle-user"></i> ' + MC.esc(s.nombre.split(' ')[0]);
      a.href = MC.ruta(s.tipo === 'empleado' ? 'vistas/admin/dashboard.html' : 'vistas/reservas/reservacion-consultar.html');
      a.title = s.tipo === 'empleado' ? 'Ir al panel administrativo' : 'Mis reservaciones';
    });
    MC.actualizarContadorCarrito();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-cerrar-sesion]')) return;
    e.preventDefault();
    MC.toast('Sesión cerrada', 'info');
    setTimeout(MC.sesion.cerrar, 500);
  });

  /* ---------- Listado con búsqueda y paginación ----------
   * MC.listado({
   *   antesDe: elemento,               // dónde insertar la tarjeta del listado
   *   coleccion: 'usuarios',
   *   columnas: [{ titulo, campo } | { titulo, render: fn(reg) }],
   *   buscarEn: ['nombre', ...], filtro, porPagina (5),
   *   acciones: fn(reg) -> html,       // enlaces por fila (opcional)
   *   alSeleccionar: fn(reg),          // clic en la fila
   *   seleccionado: folio
   * }) -> { refrescar(), seleccionar(folio) }
   */
  MC.insigniaEstado = function (estado) {
    var ok = /^(activ|disponible|pagad|autorizad|emitida|libre|enviada)/i.test(estado || '');
    var mal = /^(baja|retirad|cancelad|rechazad|devuelt)/i.test(estado || '');
    return '<span class="insignia ' + (ok ? 'insignia--ok' : mal ? 'insignia--mal' : '') + '">' + MC.esc(estado || '—') + '</span>';
  };

  /* Botones de paginación: anterior, ventana de páginas con elipsis y siguiente.
   * Siempre muestra la primera, la última y dos páginas alrededor de la actual. */
  MC.paginador = function (pagina, paginas) {
    var b = function (n, contenido, extra) {
      var dis = n < 1 || n > paginas;
      return '<button type="button" class="btn-pagina' + (n === pagina && !extra ? ' activa' : '') + '" data-pagina="' + n + '"' +
        (dis ? ' disabled' : '') + (n === pagina && !extra ? ' aria-current="page"' : '') + (extra || '') + '>' + contenido + '</button>';
    };
    var html = [b(pagina - 1, '<i class="fa-solid fa-chevron-left"></i>', ' aria-label="Página anterior"')];
    var previa = 0;
    for (var i = 1; i <= paginas; i++) {
      if (i !== 1 && i !== paginas && Math.abs(i - pagina) > 2) continue;
      if (i - previa > 1) html.push('<span class="paginacion-elipsis" aria-hidden="true">…</span>');
      html.push(b(i, String(i)));
      previa = i;
    }
    html.push(b(pagina + 1, '<i class="fa-solid fa-chevron-right"></i>', ' aria-label="Página siguiente"'));
    return html.join('');
  };

  /* "6–10 de 12" a partir del resultado de MC.datos.listar */
  MC.rangoPagina = function (res) {
    if (!res.total) return '0';
    var desde = (res.pagina - 1) * res.porPagina + 1;
    return desde + '–' + Math.min(res.total, desde + res.items.length - 1) + ' de ' + res.total;
  };

  MC.listado = function (o) {
    var estado = { pagina: 1, q: '', seleccionado: o.seleccionado || null };
    var tarjeta = document.createElement('section');
    tarjeta.className = 'tarjeta-pantalla listado';
    tarjeta.innerHTML =
      '<div class="listado-barra"><input class="input-custom" type="search" placeholder="' + MC.esc(o.placeholder || 'Buscar...') + '" aria-label="Buscar en el listado">' +
      '<span class="listado-total"></span></div>' +
      '<div class="listado-tabla"><table class="tabla-listado"><thead><tr>' +
      o.columnas.map(function (c) { return '<th>' + MC.esc(c.titulo) + '</th>'; }).join('') + (o.acciones ? '<th>Acciones</th>' : '') +
      '</tr></thead><tbody></tbody></table></div>' +
      '<nav class="paginacion" aria-label="Paginación"></nav>';
    o.antesDe.parentNode.insertBefore(tarjeta, o.antesDe);

    var cuerpo = tarjeta.querySelector('tbody');
    var pag = tarjeta.querySelector('.paginacion');
    var totalEl = tarjeta.querySelector('.listado-total');
    var buscador = tarjeta.querySelector('input[type=search]');
    var cache = {};
    var espera;

    function celda(c, r) {
      if (c.render) return c.render(r);
      return MC.esc(r[c.campo]);
    }

    function pintar(res) {
      cache = {};
      totalEl.textContent = res.total + (res.total === 1 ? ' registro' : ' registros');
      var cols = o.columnas.length + (o.acciones ? 1 : 0);
      cuerpo.innerHTML = res.items.length ? res.items.map(function (r) {
        cache[r.folio] = r;
        return '<tr data-folio="' + MC.esc(r.folio) + '"' + (String(r.folio) === String(estado.seleccionado) ? ' class="seleccionada"' : '') + '>' +
          o.columnas.map(function (c) { return '<td>' + celda(c, r) + '</td>'; }).join('') +
          (o.acciones ? '<td class="listado-acciones">' + o.acciones(r) + '</td>' : '') + '</tr>';
      }).join('') : '<tr class="sin-registros"><td colspan="' + cols + '">No se encontraron registros</td></tr>';

      if (res.total) totalEl.textContent = MC.rangoPagina(res) + ' registros';
      pag.innerHTML = MC.paginador(res.pagina, res.paginas);
      estado.pagina = res.pagina;
    }

    function refrescar() {
      return MC.datos.listar(o.coleccion, {
        q: estado.q, campos: o.buscarEn, filtro: o.filtro, orden: o.orden, pagina: estado.pagina, porPagina: o.porPagina || 5
      }).then(pintar);
    }

    /* Mostrar la página donde está el registro seleccionado */
    function irAlSeleccionado() {
      if (!estado.seleccionado) return refrescar();
      return MC.datos.listar(o.coleccion, { filtro: o.filtro, orden: o.orden }).then(function (todo) {
        var i = todo.items.findIndex(function (r) { return String(r.folio) === String(estado.seleccionado); });
        if (i !== -1) estado.pagina = Math.floor(i / (o.porPagina || 5)) + 1;
        return refrescar();
      });
    }

    buscador.addEventListener('input', function () {
      clearTimeout(espera);
      espera = setTimeout(function () { estado.q = buscador.value.trim(); estado.pagina = 1; refrescar(); }, 200);
    });
    pag.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pagina]');
      if (!b || b.disabled) return;
      estado.pagina = Number(b.getAttribute('data-pagina'));
      refrescar();
    });
    cuerpo.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var tr = e.target.closest('tr[data-folio]');
      if (!tr || !o.alSeleccionar) return;
      api.seleccionar(tr.getAttribute('data-folio'));
      o.alSeleccionar(cache[tr.getAttribute('data-folio')]);
    });

    var api = {
      refrescar: refrescar,
      seleccionar: function (folio) {
        estado.seleccionado = folio;
        cuerpo.querySelectorAll('tr').forEach(function (tr) { tr.classList.toggle('seleccionada', tr.getAttribute('data-folio') === String(folio)); });
      },
      elemento: tarjeta
    };
    irAlSeleccionado();
    return api;
  };

  /* ---------- Clics por atributos ---------- */
  document.addEventListener('click', function (e) {
    var abrir = e.target.closest('[data-modal-abrir]');
    if (abrir) {
      var modal = document.getElementById(abrir.getAttribute('data-modal-abrir'));
      if (modal) modal.classList.add('open');
      return;
    }
    var cerrar = e.target.closest('[data-modal-cerrar]');
    if (cerrar) {
      var m = cerrar.closest('.modal-backdrop');
      if (m) m.classList.remove('open');
      if (!cerrar.hasAttribute('data-ir') && !cerrar.hasAttribute('data-toast')) return;
    }
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
      return;
    }

    /* El data-ir de un <form> es su destino tras guardar: no se dispara con clics dentro del formulario */
    var accion = e.target.closest('[data-ir]:not(form), [data-toast]:not(form)');
    if (accion && accion.type !== 'submit') {
      var msg = accion.getAttribute('data-toast');
      var url = accion.getAttribute('data-ir');
      if (msg) MC.toast(msg, accion.getAttribute('data-toast-tipo') || 'info');
      if (accion.tagName === 'A') e.preventDefault();
      if (url) MC.ir(url, msg ? 700 : 0);
    }

    /* Menús desplegables del encabezado */
    var alterna = e.target.closest('[data-alternar]');
    if (alterna) {
      var panel = document.getElementById(alterna.getAttribute('data-alternar'));
      document.querySelectorAll('.buscador, .menu-hamburguesa').forEach(function (p) {
        if (p !== panel) p.classList.remove('abierto');
      });
      if (panel) {
        panel.classList.toggle('abierto');
        var foco = panel.querySelector('input');
        if (foco && panel.classList.contains('abierto')) foco.focus();
      }
    } else if (!e.target.closest('.buscador, .menu-hamburguesa')) {
      document.querySelectorAll('.buscador, .menu-hamburguesa').forEach(function (p) { p.classList.remove('abierto'); });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-backdrop.open').forEach(function (m) { m.classList.remove('open'); });
    document.querySelectorAll('.buscador, .menu-hamburguesa').forEach(function (p) { p.classList.remove('abierto'); });
  });

  /* ---------- Buscador del encabezado ---------- */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('.buscador form')) {
      e.preventDefault();
      var q = (f.querySelector('input').value || '').trim().toLowerCase();
      if (!q) return MC.toast('Escribe qué deseas buscar', 'info');
      var hit = (window.MC_PANTALLAS || []).find(function (p) { return p.titulo.toLowerCase().indexOf(q) !== -1; });
      if (hit) {
        var raiz = document.body.getAttribute('data-raiz') || '.';
        MC.ir((raiz === '.' ? '' : raiz + '/') + hit.ruta);
      } else {
        MC.toast('Sin resultados para "' + q + '"', 'error');
      }
    }
  });

  /* ---------- Validación de formularios ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('form[data-validar]')) return;
    e.preventDefault();

    var invalidos = [];
    form.querySelectorAll('[required]').forEach(function (campo) {
      var vacio = campo.type === 'checkbox' ? !campo.checked : !String(campo.value).trim();
      if (campo.disabled || campo.readOnly) vacio = false;
      if (vacio) { campo.setAttribute('aria-invalid', 'true'); invalidos.push(campo); }
      else campo.removeAttribute('aria-invalid');
    });

    if (invalidos.length) {
      invalidos[0].focus();
      return MC.toast('Completa los campos obligatorios (*)', 'error');
    }

    /* Formato de los campos capturados */
    var errorFormato = null;
    form.querySelectorAll('input:not([readonly]):not([disabled])').forEach(function (campo) {
      var v = String(campo.value).trim();
      if (!v || errorFormato) return;
      var msg = null;
      if (campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Escribe un correo electrónico válido';
      else if (campo.type === 'tel' && !/^\d{10,12}$/.test(v.replace(/[\s-]/g, ''))) msg = 'El teléfono debe tener de 10 a 12 dígitos';
      else if (campo.getAttribute('pattern') === '[0-9]*' && !/^\d+$/.test(v)) msg = 'Este campo solo acepta números enteros';
      else if (campo.getAttribute('inputmode') === 'decimal' && !/^\d+(\.\d{1,2})?$/.test(v)) msg = 'Escribe una cantidad válida (ej. 120.50)';
      if (msg) { campo.setAttribute('aria-invalid', 'true'); errorFormato = { campo: campo, msg: msg }; }
    });
    if (errorFormato) {
      errorFormato.campo.focus();
      return MC.toast(errorFormato.msg, 'error');
    }

    /* Las pantallas con lógica propia escuchan "mc:enviar" y llaman preventDefault() */
    var evento = new CustomEvent('mc:enviar', { cancelable: true, detail: { datos: MC.leerForm(form) } });
    if (!form.dispatchEvent(evento)) return;

    MC.toast(form.getAttribute('data-exito') || 'Operación realizada con éxito', 'success');
    MC.ir(form.getAttribute('data-ir'), 800);
  });

  document.addEventListener('input', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('aria-invalid') && String(e.target.value).trim()) {
      e.target.removeAttribute('aria-invalid');
    }
  });

  /* ---------- Steppers numéricos ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-paso]');
    if (!btn) return;
    var cont = btn.closest('[data-stepper]');
    var input = cont && cont.querySelector('input');
    if (!input) return;
    var min = Number(cont.getAttribute('data-min') || 0);
    var max = Number(cont.getAttribute('data-max') || 99);
    var val = Math.min(max, Math.max(min, (parseInt(input.value, 10) || 0) + Number(btn.getAttribute('data-paso'))));
    input.value = val;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  /* ---------- Previsualización de fotos ---------- */
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input.matches('input[type=file][data-previsualizar]') || !input.files[0]) return;
    var avatar = input.closest('label').querySelector('.avatar');
    var url = URL.createObjectURL(input.files[0]);
    avatar.innerHTML = '<img alt="Vista previa" src="' + url + '">';
  });
})();
