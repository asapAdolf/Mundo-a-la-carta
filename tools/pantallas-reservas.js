/**
 * Pantallas de reservaciones, recepciones, inmersiones, disponibilidad,
 * resúmenes y recibo (PA_07_xx). Tipo de estilos: reservas.
 */
const { pantalla, conLateral, lateral, icono, esc } = require('./generar-pantallas');
const { campo, folio, btn, acciones } = require('./lib');

const TIPOS_EVENTO = ['Cumpleaños', 'Aniversario', 'Boda', 'Corporativo', 'Otro'];
const MENUS = ['Gourmet', 'Ejecutivo', 'Infantil', 'Degustación'];
const MESAS = ['Estándar', 'Redonda', 'Privada', 'Terraza'];

/* Definición base: id, etiqueta, tipo, obligatorio, opciones */
const BASE = [
  { id: 'monto-reserva', l: 'Posible monto a pagar', t: 'double', v: '1200.00' },
  { id: 'tipo-evento', l: 'Tipo de evento', t: 's(20)', req: true, sel: TIPOS_EVENTO, v: 'Aniversario' },
  { id: 'cliente', l: 'Nombre del cliente', t: 's(150)', req: true, v: 'Juan Pérez' },
  { id: 'descorche', l: 'Descorche', t: 'bool', req: true, v: true },
  { id: 'hora-entrada', l: 'Hora de entrada', t: 'time', req: true, v: '19:30' },
  { id: 'hora-salida', l: 'Hora de salida', t: 'time', v: '22:30' },
  { id: 'comensales', l: 'No. de comensales', t: 'int(2)', req: true, v: '2' },
  { id: 'vegetariano', l: 'Menú vegetariano', t: 'bool', req: true, v: false },
  { id: 'tipo-menu', l: 'Tipo de menú', t: 's(50)', req: true, sel: MENUS, v: 'Gourmet' },
  { id: 'tipo-mesa', l: 'Tipo de mesa', t: 's(50)', req: true, sel: MESAS, v: 'Estándar' },
  { id: 'alergias', l: 'Alergias', t: 's(200)', req: true, v: 'Ninguna' },
  { id: 'vegano', l: 'Menú vegano', t: 'bool', req: true, v: false },
];
const NO_EDITABLES_ALTA = ['monto-reserva', 'hora-salida'];

function reservaForm({ editable, conDatos, archivo, folioEditable = true, estado, extra = '', botones, destino, exito, grupo, tipoFolio = 'Folio de reservación' }) {
  const cab = [];
  if (estado) cab.push(`<span class="estado-reserva">Estado <span class="insignia ${estado === 'Activa' ? 'insignia--ok' : ''}">${esc(estado)}</span></span>`);
  cab.push(folioEditable
    ? `<div style="min-width:12rem">${campo(`${tipoFolio} *`, 'int(10)', { id: 'folio', v: conDatos ? '1024' : undefined, ph: 'int(10)', ayuda: 'Ingresa el folio para consultar' })}</div>`
    : folio(tipoFolio, 'Automático'));

  const fecha = campo('Fecha (i)', 's(20)', { id: 'fecha', v: conDatos ? '15/05/2026' : 'Automática', ayuda: 'Se asigna automáticamente' });
  const obs = campo('Observaciones', 's(200)', { id: 'observaciones', span: 3, v: conDatos ? 'Mesa junto a la ventana' : undefined, ro: !editable.includes('observaciones') });

  const campos = BASE.map((b) => {
    const ed = editable.includes(b.id);
    const label = ed ? b.l + (b.req ? ' *' : '') : `${b.l} (i)`;
    const o = { id: b.id, sinAyuda: true };
    if (b.sel) o.sel = b.sel;
    if (conDatos || !ed) o.v = b.v;
    if (!conDatos && ed) delete o.v;
    if (!conDatos && !ed) o.v = b.id === 'monto-reserva' ? '0.00' : b.id === 'hora-salida' ? '' : b.v;
    return campo(label, b.t, o);
  }).join('\n');

  const form = `        <form class="tarjeta-pantalla" ${destino ? `data-validar data-exito="${esc(exito || 'Operación realizada')}" data-ir="${destino}"` : ''} novalidate>
          <div class="form-cabecera">${cab.join('')}</div>
          <div class="form-grid form-grid--4">
            ${fecha}
            ${obs}
${campos}
          </div>
          ${extra}
          ${acciones(botones, 'acciones--fin')}
        </form>`;
  return grupo ? conLateral(lateral(grupo, archivo), form) : `    <div>\n${form}\n    </div>`;
}

const grupoRes = (pref, extraItems = {}) => Object.entries({ crear: 'Alta', modificar: 'Modificar', consultar: 'Consultar', cancelar: 'Cancelar', ...extraItems })
  .map(([k, t]) => ({ archivo: `${pref}-${k}.html`, t: `${t}`, i: { crear: icono.crear, modificar: icono.modificar, consultar: icono.consulta, cancelar: icono.baja }[k] }));

const GRUPO_RES = grupoRes('reservacion');
const GRUPO_REC = grupoRes('recepcion');
const GRUPO_INM = [
  { archivo: 'inmersion-crear.html', t: 'Alta', i: icono.crear },
  { archivo: 'inmersion-consultar.html', t: 'Consultar', i: icono.consulta },
  { archivo: 'inmersion-modificar.html', t: 'Modificar', i: icono.modificar },
];

const reg = (o) => pantalla({ modulo: 'reservas', nav: 'Roles', tipo: 'reservas', scripts: ['pantallas/reservas.js'], cssExtra: ['formulario'], ...o, titulo: o.titulo.replace(/ (?=\S+$)/, '<br>') });
const ALTA_EDITABLES = BASE.map((b) => b.id).filter((i) => !NO_EDITABLES_ALTA.includes(i)).concat('observaciones');
const montoMulta = `<div class="form-grid" style="margin-top:1.1rem;grid-template-columns:repeat(2,minmax(0,1fr))">${campo('Multa por cancelación no anticipada 15% (i)', 'double', { id: 'multa', v: '0.00', ayuda: 'Calculada automáticamente' })}</div>
          <p class="aviso"><i class="fa-solid fa-triangle-exclamation"></i><span>Al confirmar, el estado cambia a <strong>baja</strong> y se aplica la multa por cancelación no anticipada.</span></p>`;

/* ---------- Reservación ---------- */
reg({ archivo: 'reservacion-crear.html', titulo: 'Alta de reservación', tituloPlano: 'Alta de reservación', codigo: 'PA_07_01_01',
  cuerpo: reservaForm({ editable: ALTA_EDITABLES, conDatos: false, archivo: 'reservacion-crear.html', folioEditable: false, grupo: GRUPO_RES,
    destino: 'reservacion-resumen.html', exito: 'Datos validados, revisa el resumen',
    botones: [btn('Consultar disponibilidad', { tipo: 'secondary', ir: 'disponibilidad.html' }), btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Confirmar', { submit: true })] }) });

reg({ archivo: 'disponibilidad.html', titulo: 'Consultar disponibilidad', tituloPlano: 'Consultar disponibilidad', codigo: 'PA_07_02_01', heroCompacto: true,
  cuerpo: `    <form class="tarjeta-pantalla" data-validar data-exito="Sala asignada a la reservación" data-ir="back" novalidate>
      <div class="form-cabecera">${folio('Folio de reservación', 'Automático')}</div>
      <div class="salas-layout">
        <div class="form-grid" style="grid-template-columns:1fr">
          ${campo('Fecha', 'date', { sinAyuda: true })}
          ${campo('Tipo de evento *', 's(20)', { id: 'tipo-evento', sel: TIPOS_EVENTO })}
          ${campo('Hora de entrada', 'time', { id: 'hora-entrada', sinAyuda: true })}
          ${campo('No. de comensales *', 'int(2)', { id: 'comensales' })}
          ${campo('Tipo de menú', 's(20)', { id: 'tipo-menu', sel: MENUS })}
          ${campo('Tipo de ambientación *', 's(20)', { id: 'ambientacion', sel: ['Torre Eiffel', 'Playa', 'Selva', 'Espacio', 'Clásica'] })}
        </div>
        <div>
          <div class="leyenda"><span><i class="sala-libre"></i>Salas disponibles</span><span><i class="sala-ocupada"></i>Salas ocupadas</span><span><i class="sala-elegida"></i>Sala seleccionada</span></div>
          <div class="salas" role="group" aria-label="Salas">
            ${['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Sala 6'].map((s, i) => `<button type="button" class="sala" data-nombre="${s}"${[1, 4].includes(i) ? ' disabled' : ''}><i class="fa-solid fa-door-open"></i>${s}<small>${[1, 4].includes(i) ? 'Ocupada' : `${6 + i * 2} personas`}</small></button>`).join('\n            ')}
          </div>
          <div class="form-grid" style="grid-template-columns:1fr;margin-top:1rem">${campo('Sala seleccionada (i)', 's(20)', { id: 'sala-elegida', ph: 'Ninguna', sinAyuda: true })}</div>
        </div>
      </div>
      ${acciones([btn('Confirmar', { submit: true, id: 'btn-confirmar-sala', dis: true }), btn('Regresar', { tipo: 'secondary', ir: 'back' })])}
    </form>` });

const datosResumen = (tipo) => `<dl class="resumen-datos">
      <div><dt>Fecha</dt><dd>15/05/2026</dd></div><div><dt>Folio</dt><dd>1024</dd></div>
      <div><dt>Tipo de evento</dt><dd>Aniversario</dd></div><div><dt>Hora de entrada</dt><dd>19:30</dd></div>
      <div><dt>Nombre del cliente</dt><dd>Juan Pérez</dd></div><div><dt>Número de comensales</dt><dd>2</dd></div>
      <div><dt>Hora de salida</dt><dd>22:30</dd></div><div><dt>Tipo de ambientación</dt><dd>Torre Eiffel</dd></div>
      <div><dt>Tipo de mesa</dt><dd>Estándar</dd></div><div><dt>Menú vegetariano</dt><dd>No</dd></div>
      <div><dt>Alergias</dt><dd>Ninguna</dd></div><div><dt>Menú vegano</dt><dd>No</dd></div>
      <div class="destacado"><dt>Posible monto a pagar</dt><dd>$1,200.00</dd></div></dl>`;

reg({ archivo: 'reservacion-resumen.html', titulo: 'Resumen de reservación', tituloPlano: 'Resumen de reservación', codigo: 'PA_07_01_02', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla">
      ${datosResumen()}
      <label class="acepto"><input type="checkbox" id="acepto"> Acepto los términos y condiciones de la reservación</label>
      ${acciones([btn('Confirmar', { id: 'btn-confirmar-resumen', ir: 'recepcion-crear.html', toast: 'Reservación confirmada', toastTipo: 'success' }), btn('Regresar', { tipo: 'secondary', ir: 'reservacion-crear.html' })])}
    </section>` });

reg({ archivo: 'reservacion-modificar.html', titulo: 'Modificar reservación', tituloPlano: 'Modificar reservación', codigo: 'PA_07_01_03',
  cuerpo: reservaForm({ editable: ['cliente', 'hora-entrada', 'tipo-mesa', 'alergias', 'observaciones'], conDatos: true, archivo: 'reservacion-modificar.html', estado: 'Activa', grupo: GRUPO_RES,
    destino: 'reservacion-consultar.html', exito: 'Cambios guardados',
    botones: [btn('Consultar disponibilidad', { tipo: 'secondary', ir: 'disponibilidad.html' }), btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Guardar', { submit: true })] }) });

reg({ archivo: 'reservacion-consultar.html', titulo: 'Consultar reservación', tituloPlano: 'Consultar reservación', codigo: 'PA_07_01_04',
  cuerpo: reservaForm({ editable: [], conDatos: true, archivo: 'reservacion-consultar.html', estado: 'Activa', grupo: GRUPO_RES,
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' })] }) });

reg({ archivo: 'reservacion-cancelar.html', titulo: 'Cancelar reservación', tituloPlano: 'Cancelar reservación', codigo: 'PA_07_06_01',
  cuerpo: reservaForm({ editable: ['observaciones'], conDatos: true, archivo: 'reservacion-cancelar.html', estado: 'Activa', grupo: GRUPO_RES, extra: montoMulta,
    destino: '../catalogo.html', exito: 'Reservación cancelada (baja) y multa aplicada',
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Confirmar', { submit: true })] }) });

reg({ archivo: 'reservacion-cancelar-devolucion.html', titulo: 'Cancelar reservación', tituloPlano: 'Cancelar reservación con devolución', codigo: 'PA_07_05_01',
  cuerpo: reservaForm({ editable: [], conDatos: true, archivo: 'reservacion-cancelar-devolucion.html', estado: 'Activa', grupo: GRUPO_RES,
    extra: `<div class="form-grid" style="margin-top:1.1rem">
            ${campo('Motivo de cancelación *', 's(150)', { id: 'motivo' })}
            ${campo('Observaciones', 's(250)', { id: 'observaciones-cancelacion' })}
            ${campo('Monto a devolver (i)', 'double', { id: 'monto-devolver', v: '0.00', ayuda: 'Calculado automáticamente' })}
            ${campo('Medio de devolución *', 's(50)', { id: 'medio-devolucion', sel: ['Efectivo', 'Tarjeta', 'Transferencia'] })}
          </div>`,
    destino: '../catalogo.html', exito: 'Reservación cancelada y devolución registrada',
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Confirmar', { submit: true })] }) });

/* ---------- Recepción ---------- */
reg({ archivo: 'recepcion-crear.html', titulo: 'Alta de recepción', tituloPlano: 'Alta de recepción', codigo: 'PA_07_03_01',
  cuerpo: reservaForm({ editable: ['observaciones'], conDatos: true, archivo: 'recepcion-crear.html', estado: 'Activa', grupo: GRUPO_REC,
    destino: 'recepcion-resumen.html', exito: 'Datos validados, revisa el resumen',
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Confirmar', { submit: true })] }) });

reg({ archivo: 'recepcion-resumen.html', titulo: 'Resumen de recepción', tituloPlano: 'Resumen de recepción', codigo: 'PA_07_03_02', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla">
      ${datosResumen()}
      <label class="acepto"><input type="checkbox" id="acepto"> Acepto los datos de la recepción</label>
      ${acciones([btn('Confirmar', { id: 'btn-confirmar-resumen', ir: '../catalogo.html', toast: 'Recepción registrada', toastTipo: 'success' }), btn('Regresar', { tipo: 'secondary', ir: 'recepcion-crear.html' })])}
    </section>` });

reg({ archivo: 'recepcion-modificar.html', titulo: 'Modificar recepción', tituloPlano: 'Modificar recepción', codigo: 'PA_07_03_03',
  cuerpo: reservaForm({ editable: ['cliente', 'hora-entrada', 'tipo-mesa', 'alergias', 'observaciones'], conDatos: true, archivo: 'recepcion-modificar.html', estado: 'Activa', grupo: GRUPO_REC,
    destino: 'recepcion-consultar.html', exito: 'Cambios guardados',
    botones: [btn('Consultar disponibilidad', { tipo: 'secondary', ir: 'disponibilidad.html' }), btn('Cancelar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Guardar', { submit: true })] }) });

reg({ archivo: 'recepcion-consultar.html', titulo: 'Consultar recepción', tituloPlano: 'Consultar recepción', codigo: 'PA_07_03_04',
  cuerpo: reservaForm({ editable: [], conDatos: true, archivo: 'recepcion-consultar.html', estado: 'Activa', grupo: GRUPO_REC,
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' })] }) });

reg({ archivo: 'recepcion-cancelar.html', titulo: 'Cancelar recepción', tituloPlano: 'Cancelar recepción', codigo: 'PA_07_03_05',
  cuerpo: reservaForm({ editable: ['observaciones'], conDatos: true, archivo: 'recepcion-cancelar.html', estado: 'Activa', grupo: GRUPO_REC, extra: montoMulta,
    destino: '../catalogo.html', exito: 'Recepción dada de baja y multa aplicada',
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Confirmar', { submit: true })] }) });

/* ---------- Inmersión ---------- */
reg({ archivo: 'inmersion-crear.html', titulo: 'Alta de inmersión', tituloPlano: 'Alta de inmersión', codigo: 'PA_07_04_01',
  cuerpo: reservaForm({ editable: ['observaciones'], conDatos: true, archivo: 'inmersion-crear.html', estado: 'Activa', grupo: GRUPO_INM,
    destino: 'inmersion-consultar.html', exito: 'Inmersión guardada',
    botones: [btn('Cancelar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Guardar', { submit: true })] }) });

reg({ archivo: 'inmersion-consultar.html', titulo: 'Consultar inmersión', tituloPlano: 'Consultar inmersión', codigo: 'PA_07_04_02',
  cuerpo: reservaForm({ editable: [], conDatos: true, archivo: 'inmersion-consultar.html', estado: 'Activa', grupo: GRUPO_INM,
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Modificar', { ir: 'inmersion-modificar.html' })] }) });

reg({ archivo: 'inmersion-modificar.html', titulo: 'Modificar inmersión', tituloPlano: 'Modificar inmersión', codigo: 'PA_07_04_03',
  cuerpo: reservaForm({ editable: ['hora-entrada', 'comensales', 'alergias'], conDatos: true, archivo: 'inmersion-modificar.html', grupo: GRUPO_INM,
    extra: `<div class="form-grid" style="margin-top:1.1rem">${campo('Precio por persona (i)', 'double', { id: 'precio-persona', v: '600.00', sinAyuda: true })}${campo('Extras (i)', 'f(20)', { id: 'extras', v: 'Ambientación Torre Eiffel', sinAyuda: true })}</div>`,
    folioEditable: true,
    botones: [btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' }), btn('Personalizar', { toast: 'Guarda los cambios y pasa a la pantalla PA_07_04_03.1 (pendiente en el prototipo)' })] }) });

/* ---------- Recibo ---------- */
pantalla({ archivo: 'recibo-reserva.html', modulo: 'reservas', nav: 'Experiencias', tipo: 'reservas', scripts: [], titulo: 'Recibo de Reserva', tituloPlano: 'Recibo de reserva', heroCompacto: true,
  cuerpo: `    <section class="recibo">
      <span class="recibo-icono"><i class="fa-solid fa-check"></i></span>
      <h2>¡Gracias por tu preferencia!</h2>
      <p>Aquí tienes los detalles de tu reserva. Tu reserva ha sido confirmada.</p>
      <div class="tarjeta-pantalla recibo-cuerpo">
        <dl class="resumen-datos">
          <div><dt>Fecha</dt><dd>15 de Mayo de 2026</dd></div><div><dt>Horario</dt><dd>19:30 p.m.</dd></div>
          <div><dt>Mesa</dt><dd>Mesa 3 (Estándar)</dd></div><div><dt>Comensales</dt><dd>2 personas</dd></div>
          <div><dt>Tipo de menú</dt><dd>Gourmet</dd></div><div><dt>Tipo de ambientación</dt><dd>Torre Eiffel</dd></div>
        </dl>
        <ul class="recibo-lineas">
          <li><span>Subtotal</span><span>$1,200.00</span></li><li><span>Impuestos (16%)</span><span>$192.00</span></li>
          <li class="total"><span>Total</span><span>$1,392.00</span></li>
        </ul>
      </div>
      <p style="margin-top:1rem">Gracias por confiar en nosotros. ¡Esperamos que disfrutes de tu experiencia! Te esperamos para que disfrutes de una experiencia única.</p>
      ${acciones([btn('Imprimir recibo', { tipo: 'secondary', icono: 'fa-print', attr: 'onclick="window.print()"' }), btn('Volver a inicio', { ir: '../catalogo.html' }), btn('Ver mis reservas', { tipo: 'secondary', ir: 'reservacion-consultar.html' })], 'acciones--centro')}
    </section>` });
