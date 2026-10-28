/**
 * tools/generar-pantallas.js
 * Genera las pantallas HTML del frontend a partir del prototipo pantallas.pdf:
 *   - index.html (en la raíz: Login / Cuenta)
 *   - vistas/catalogo.html (Catálogo general de pantallas)
 *   - vistas/<modulo>/*.html (Pantallas organizadas por carpeta de módulo)
 * Uso:  node tools/generar-pantallas.js
 */
const path = require('path');
const { esc, campo, render, folio, foto, btn, acciones, modal } = require('./lib');

const RAIZ = path.join(__dirname, '..');
const SALIDA = path.join(RAIZ, 'vistas');
const P = []; // pantallas registradas

const pantalla = (p) => P.push(p);
const icono = { crear: 'fa-circle-plus', modificar: 'fa-pen-to-square', baja: 'fa-trash-can', consulta: 'fa-magnifying-glass', cancelar: 'fa-trash-can' };

const lateral = (items, activo) =>
  `<nav class="lateral" aria-label="Acciones">${items.map((i) =>
    `<a href="${i.archivo}" title="${esc(i.t)}" class="${i.archivo === activo ? 'activo' : ''}"><i class="fa-solid ${i.i}"></i></a>`).join('')}</nav>`;

const conLateral = (lat, contenido) => `    <div class="cuerpo-lateral">\n      ${lat}\n      <div class="principal">\n${contenido}\n      </div>\n    </div>`;

/* =====================================================================
   AUTENTICACIÓN (index.html en la raíz = Login / Cuenta)
   ===================================================================== */
pantalla({
  archivo: 'index.html', ruta: 'index.html', modulo: 'auth', nav: 'Login', tipo: 'auth', titulo: 'Login/Cuenta', tituloPlano: 'Login / Cuenta',
  cuerpo: `    <section class="auth-login">
      <div class="auth-bienvenida">
        <h2>¡Bienvenido a Mundo a la Carta!</h2>
        <p>Por favor, ingrese a su cuenta para poder continuar navegando en la página y poder realizar su reservación</p>
      </div>
      <div class="auth-panel">
        <div class="auth-avatar"><i class="fa-solid fa-user"></i></div>
        <form class="auth-form" data-validar data-exito="Sesión iniciada correctamente" data-ir="vistas/catalogo.html" novalidate>
          <input class="input-custom" type="text" id="usuario" name="usuario" placeholder="Usuario" aria-label="Usuario" autocomplete="username" required>
          <input class="input-custom" type="password" id="password" name="password" placeholder="Contraseña" aria-label="Contraseña" autocomplete="current-password" required>
          <p class="auth-enlaces">¿Olvidaste tu contraseña? <a href="#" data-toast="Te enviamos instrucciones a tu correo">Recuperar contraseña</a><br>
            ¿No tienes una cuenta? <a href="vistas/auth/acceso-registro.html">Crear usuario</a></p>
          <div class="acciones acciones--centro" style="margin-top:0">${btn('Aceptar', { submit: true })}</div>
        </form>
      </div>
    </section>`,
});

const USUARIO = [
  ['Nombre *', 's(150)'], ['Dirección', 's(150)'],
  ['Tipo de cliente *', 's(150)'], ['Contacto de emergencia', 's(150)'],
  ['Teléfono *', 'tel', { ayuda: 'Teléfono · máx. 12 dígitos' }], ['Teléfono del contacto de emergencia', 'tel'],
  ['Correo Electrónico *', 'email'], ['Observaciones especiales', 's(150)'],
];

const tabsAcceso = (act) => `<div class="pestanas" role="tablist"><a href="acceso-login.html" class="${act === 'login' ? 'activo' : ''}">Acceso</a><a href="acceso-registro.html" class="${act === 'registro' ? 'activo' : ''}">Registro</a></div>`;

pantalla({
  archivo: 'acceso-login.html', modulo: 'auth', nav: 'Usuario', tipo: 'auth', titulo: 'Acceso', tituloPlano: 'Acceso · Inicio de sesión', heroCompacto: true,
  cssExtra: ['formulario'],
  cuerpo: `    <section class="tarjeta-pantalla auth-tarjeta">
      ${tabsAcceso('login')}
      <h2>Inicio de Sesión</h2>
      <form data-validar data-exito="Bienvenido de nuevo" data-ir="../carta/carta.html" novalidate>
        <div class="form-grid" style="grid-template-columns:1fr">
          ${render([['Correo Electrónico o Usuario *', 'text(150)', { id: 'correo-electronico' }], ['Contraseña *', 'pass', { id: 'password' }]])}
        </div>
        ${acciones([btn('Continuar', { submit: true }), btn('Crear Cuenta', { tipo: 'secondary', ir: 'acceso-registro.html' })], 'acciones--centro')}
      </form>
    </section>`,
});

pantalla({
  archivo: 'acceso-registro.html', modulo: 'auth', nav: 'Usuario', tipo: 'auth', titulo: 'Acceso', tituloPlano: 'Acceso · Crear cuenta', heroCompacto: true,
  cssExtra: ['formulario'],
  cuerpo: `    <section class="tarjeta-pantalla auth-tarjeta" style="max-width:820px">
      ${tabsAcceso('registro')}
      <h2>Crear Cuenta</h2>
      <form data-validar data-exito="Cuenta creada correctamente" data-ir="acceso-login.html" novalidate>
        <div class="form-grid">${render(USUARIO)}</div>
        ${acciones([btn('Guardar', { submit: true }), btn('Regresar', { tipo: 'secondary', ir: 'acceso-login.html' })])}
      </form>
    </section>`,
});

/* =====================================================================
   CRUD (usuarios, souvenirs, roles/empleados, transporte)
   ===================================================================== */
function crud({ ent, modulo, nav, singular, folioLabel, defs, muestra, fotoTexto, fotoIcono, titulos, estado, prefijoFolio = '' }) {
  const arch = (m) => `${ent}-${m}.html`;
  const lat = ['crear', 'modificar', 'baja', 'consulta'].map((m) => ({ archivo: arch(m), t: titulos[m], i: icono[m] }));

  ['crear', 'modificar', 'baja', 'consulta'].forEach((modo) => {
    const ro = modo === 'baja' || modo === 'consulta';
    const campos = render(defs, { soloLectura: ro, muestra: modo === 'crear' ? {} : muestra });
    const cab = [
      estado && modo !== 'crear' ? `<div class="folio"><span>Estado <i class="fa-solid fa-circle-info dato-info"></i></span><strong>${esc(estado)}</strong></div>` : '',
      folio(folioLabel, modo === 'crear' ? 'Automático' : prefijoFolio + '000123'),
    ].join('');
    const fotoHtml = modo === 'crear' || modo === 'modificar' ? foto(fotoTexto[modo === 'crear' ? 0 : 1] || fotoTexto[0], fotoIcono) : '';

    let botones;
    let extra = '';
    if (modo === 'crear') botones = [btn('Guardar', { submit: true }), btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' })];
    else if (modo === 'modificar') botones = [btn('Guardar cambios', { submit: true }), btn('Regresar', { tipo: 'secondary', ir: arch('crear') })];
    else if (modo === 'baja') {
      botones = [
        btn('Baja temporal', { tipo: 'secondary', modal: 'modal-temporal' }),
        btn('Baja definitiva', { tipo: 'danger', modal: 'modal-definitiva' }),
        btn('Regresar', { tipo: 'secondary', ir: arch('crear') }),
      ];
      extra = [
        modal({ id: 'modal-temporal', titulo: 'Confirmar baja temporal', texto: `El registro de ${esc(singular)} quedará <strong>inactivo</strong> y podrá reactivarse más adelante.`,
          botones: [btn('Cancelar', { tipo: 'secondary', cerrar: true }), btn('Confirmar baja temporal', { cerrar: true, toast: 'Baja temporal registrada', toastTipo: 'success', ir: arch('consulta') })] }),
        modal({ id: 'modal-definitiva', titulo: 'Confirmar baja definitiva', texto: `Esta acción es <strong>permanente</strong>. ¿Deseas dar de baja definitivamente a ${esc(singular)}?`,
          botones: [btn('Cancelar', { tipo: 'secondary', cerrar: true }), btn('Baja definitiva', { tipo: 'danger', cerrar: true, toast: 'Baja definitiva procesada', toastTipo: 'success', ir: arch('consulta') })] }),
      ].join('\n');
    } else botones = [btn('Regresar', { tipo: 'secondary', ir: arch('crear') })];

    const exito = { crear: `${singular} creado con éxito`, modificar: 'Cambios guardados con éxito' }[modo];
    const destino = modo === 'crear' || modo === 'modificar' ? arch('consulta') : '';
    const cuerpo = conLateral(lateral(lat, arch(modo)), `        <form class="tarjeta-pantalla" ${destino ? `data-validar data-exito="${esc(exito)}" data-ir="${destino}"` : ''} novalidate>
          <div class="form-cabecera">${cab}</div>
          <div class="form-grid">
${campos}
          </div>
          <div class="form-pie">
            ${acciones(botones)}
            ${fotoHtml}
          </div>
        </form>`);

    pantalla({
      archivo: arch(modo), modulo, nav, tipo: 'formulario', titulo: titulos[modo].replace(' ', '<br>'), tituloPlano: titulos[modo],
      cuerpo, extra,
    });
  });
}

crud({
  ent: 'usuario', modulo: 'usuario', nav: 'Usuario', singular: 'usuario', folioLabel: 'Folio del cliente', defs: USUARIO,
  fotoTexto: ['Subir foto de perfil'], fotoIcono: 'fa-user',
  titulos: { crear: 'Crear usuario', modificar: 'Modificar usuario', baja: 'Baja usuario', consulta: 'Consulta usuario' },
  muestra: {
    nombre: 'María Fernanda López', direccion: 'Av. Reforma 123, CDMX', 'tipo-de-cliente': 'Frecuente', 'contacto-de-emergencia': 'Luis López',
    telefono: '5512345678', 'telefono-del-contacto-de-emergencia': '5587654321', 'correo-electronico': 'maria.lopez@correo.com', 'observaciones-especiales': 'Sin gluten',
  },
});

crud({
  ent: 'souvenir', modulo: 'souvenir', nav: 'Souvenir', singular: 'souvenir', folioLabel: 'Folio del souvenir',
  defs: [
    ['Nombre *', 's(150)'], ['Precio por unidad *', 'int(10)'],
    ['Departamento *', 's(50)'], ['Clave del proveedor *', 'int(5)'],
    ['Descripción', 'ta(300)', { ancho: true }],
  ],
  fotoTexto: ['Subir foto de souvenir'], fotoIcono: 'fa-gift',
  titulos: { crear: 'Crear souvenir', modificar: 'Modificar souvenir', baja: 'Baja souvenir', consulta: 'Consulta souvenir' },
  muestra: { nombre: 'Taza UMAD', 'precio-por-unidad': '180', departamento: 'Artesanías', 'clave-del-proveedor': '10234', descripcion: 'Taza de talavera pintada a mano' },
});

crud({
  ent: 'rol', modulo: 'empleados', nav: 'Roles', singular: 'rol / empleado', folioLabel: 'Folio del empleado',
  defs: [
    ['Nombre *', 's(150)'], ['Teléfono', 'tel', { ayuda: 'Teléfono · máx. 12 dígitos' }],
    ['Área *', 's(50)', { sel: ['Administración', 'Ventas', 'Cocina', 'Operaciones'] }], ['Correo', 'email', { ayuda: 'Correo · máx. 50 caracteres' }],
    ['Rol/puesto *', 's(50)', { id: 'rol-puesto', sel: ['Gerente', 'Empleado', 'Mesero', 'Administrador'] }], ['Clave del contrato *', 'int(10)'],
  ],
  fotoTexto: ['Subir foto del empleado', 'Actualizar foto del empleado'], fotoIcono: 'fa-user-tie',
  titulos: { crear: 'Crear rol / empleado', modificar: 'Modificar rol / empleado', baja: 'Baja rol / empleado', consulta: 'Consulta rol / empleado' },
  muestra: { nombre: 'Carlos Eduardo Ramírez', telefono: '5543219876', area: 'Administración', correo: 'carlos.ramirez@mundoalacarta.com', 'rol-puesto': 'Gerente', 'clave-del-contrato': '8492019' },
});

crud({
  ent: 'transporte', modulo: 'transporte', nav: 'Local', singular: 'unidad de transporte', folioLabel: 'Folio de la unidad', estado: 'Activo',
  defs: [
    ['Busca Número de serie (VIN) *', 's(17)', { id: 'vin', libre: true, ph: 'Número de serie' }], ['Equipamiento Inmersivo', 's(150)'],
    ['Marca *', 's(50)'], ['Capacidad *', 'int(5)'],
    ['Modelo *', 's(50)'], ['Folio de Póliza de seguro *', 's(30)'],
    ['Placas *', 's(15)'], ['Vigencia de Póliza *', 'date'],
    ['Tipo de Vehículo *', 's(50)'], ['Vigencia de Tarjeta de Circulación *', 'date'],
    ['Color *', 's(30)'], ['Estatus de Verificación Vehicular *', 's(30)'],
  ],
  fotoTexto: ['Subir imagen de la unidad', 'Modificar imagen de la unidad'], fotoIcono: 'fa-van-shuttle',
  titulos: { crear: 'Alta transporte', modificar: 'Modificar transporte', baja: 'Baja transporte', consulta: 'Consulta transporte' },
  muestra: {
    vin: '1HGCM82633A004352', 'equipamiento-inmersivo': 'Pantallas 4K y audio envolvente', marca: 'Mercedes-Benz', capacidad: '18', modelo: 'Sprinter 2024',
    'folio-de-poliza-de-seguro': 'POL-2026-0457', placas: 'ABC-123-D', 'vigencia-de-poliza': '2027-03-15', 'tipo-de-vehiculo': 'Van',
    'vigencia-de-tarjeta-de-circulacion': '2027-01-20', color: 'Blanco', 'estatus-de-verificacion-vehicular': 'Vigente',
  },
});

module.exports = { P, pantalla, conLateral, lateral, icono, SALIDA, RAIZ, esc };
require('./pantallas-reservas');
require('./pantallas-operacion');
require('./escribir');
