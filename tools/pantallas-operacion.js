/**
 * Pantallas operativas: carta, carrito, checkout, venta de souvenirs,
 * comandas (mesero), compras y devoluciones.
 */
const { pantalla, conLateral, lateral, icono, esc } = require('./generar-pantallas');
const { campo, render, folio, btn, acciones, modal } = require('./lib');

/* =====================================================================
   CARTA Y PAGOS
   ===================================================================== */
const PRODUCTOS = [
  ['champagne', 'Dom Pérignon Vintage Flute', 35.5, 'fa-champagne-glasses'],
  ['popcorn', 'Saffron & Gold Leaf Popcorn', 14.5, 'fa-bowl-food'],
  ['tapas-jamon', 'Iberian Ham & Olive Tapas', 22.09, 'fa-bacon'],
  ['arancini', 'Truffled Wild Mushroom Arancini', 18.5, 'fa-bowl-rice'],
  ['old-fashioned', 'Signature Smoked Old Fashioned Cocktail', 18.5, 'fa-martini-glass-citrus'],
  ['foie-gras', 'Seared Foie Gras Crostini', 22, 'fa-bread-slice'],
  ['pinot-noir', 'Domaine Serene Pinot Noir Glass', 94, 'fa-wine-glass'],
  ['agua', 'Hildon Premium Sparkling Water', 8, 'fa-glass-water'],
  ['caviar', 'Caviar & Blini Bites', 13, 'fa-fish'],
  ['salmon', 'Smoked Salmon & Cream Cheese Rolls', 18, 'fa-fish-fins'],
  ['huevos', 'Truffle Deviled Eggs', 8, 'fa-egg'],
  ['baklava', 'Pistachio & Rosewater Baklava', 18, 'fa-cookie-bite'],
];

const producto = ([id, nombre, precio, ic]) => `        <article class="producto" data-id="${id}" data-nombre="${esc(nombre)}" data-precio="${precio}">
          <div class="producto-imagen"><i class="fa-solid ${ic}" aria-hidden="true"></i></div>
          <div class="stepper-mini"><button type="button" data-delta="-1" aria-label="Quitar ${esc(nombre)}">–</button><span class="cant">0</span><button type="button" data-delta="1" aria-label="Agregar ${esc(nombre)}">+</button></div>
          <div class="producto-datos"><span>${esc(nombre)}</span><span class="precio">$${precio.toFixed(2)}</span></div>
        </article>`;

pantalla({ archivo: 'carta.html', modulo: 'carta', nav: 'Usuario', tipo: 'carta', titulo: '', tituloPlano: 'Carta', heroCompacto: true, scripts: ['carrito.js', 'pantallas/carta.js'],
  cuerpo: `    <div class="carta-barra" style="position:relative">
      <button type="button" class="carrito-boton" id="carrito-abrir" aria-label="Ver carrito"><i class="fa-solid fa-cart-shopping"></i><span class="contador-carrito" id="carrito-contador">0</span></button>
      <aside class="carrito-panel" id="carrito-panel" aria-label="Carrito">
        <div class="carrito-cab"><span>Descripción</span><span>Cantidad</span><span>Subtotal</span></div>
        <div id="carrito-lista"></div>
        <div class="carrito-total"><h3>Total</h3><p><span>Total de la compra:</span><span id="carrito-total">$0.00</span></p></div>
        <button type="button" class="btn-pagar" data-ir="carrito.html">PAGAR<small>Procesar pago</small></button>
      </aside>
    </div>
    <section class="carta-grid" aria-label="Carta">
${PRODUCTOS.map(producto).join('\n')}
    </section>` });

pantalla({ archivo: 'carrito.html', modulo: 'carta', nav: 'Experiencia Virtual', tipo: 'carta', titulo: 'Tu carrito de compra', tituloPlano: 'Carrito de compra', scripts: ['carrito.js'],
  cuerpo: `    <section class="carrito-pagina">
      <div class="tarjeta-pantalla">
        <h2 class="panel-titulo">Resumen del pedido</h2>
        <ul class="lineas-pedido" data-render="lineas"></ul>
        <div class="form-grid" style="grid-template-columns:1fr;margin-top:1.25rem;display:grid">
          ${campo('Método de entrega *', 's(30)', { id: 'entrega', sel: ['Experiencia Virtual', 'Recoger en sucursal', 'Servicio a domicilio'], v: 'Experiencia Virtual', sinAyuda: true })}
        </div>
      </div>
      <div>
        <div class="totales-pedido">
          <p><span>Subtotal:</span><span data-render="subtotal">$0.00</span></p>
          <p><span>Servicio:</span><span data-render="servicio">$0.00</span></p>
          <p><span>Impuestos (IVA 8%):</span><span data-render="iva">$0.00</span></p>
          <p class="gran-total"><span>TOTAL DE COMPRA:</span><span data-render="total">$0.00</span></p>
        </div>
        <div class="acciones" style="flex-direction:column">
          <button type="button" class="btn-pagar" data-ir="checkout.html">PAGAR AHORA</button>
          ${btn('Seguir comprando', { tipo: 'secondary', ir: 'carta.html' })}
        </div>
      </div>
    </section>` });

pantalla({ archivo: 'checkout.html', modulo: 'carta', nav: 'Usuario', tipo: 'pagos', titulo: 'Métodos de<br>pago / checkout', tituloPlano: 'Métodos de pago / checkout', scripts: ['carrito.js', 'pantallas/pagos.js'],
  cuerpo: `    <section class="pago-layout pago-layout--divisor">
      <div>
        <div class="pago-titulo"><h2>Métodos guardados</h2><span>3 Métodos Listos</span></div>
        <button type="button" class="metodo seleccionado" data-metodo="Visa débito ••• 4821"><span class="metodo-icono">VISA</span><span><strong>Visa débito ••• 4821 <span class="insignia">Principal</span></strong><small>Juan Pérez • Expira 08/28</small></span></button>
        <button type="button" class="metodo" data-metodo="PayPal"><span class="metodo-icono metodo-icono--paypal"><i class="fa-brands fa-paypal"></i></span><span><strong>PayPal</strong><small>juan.perez@email.com</small></span></button>
        <button type="button" class="metodo" data-metodo="Apple Pay"><span class="metodo-icono metodo-icono--apple"><i class="fa-brands fa-apple"></i></span><span><strong>Apple Pay / Digital Wallet</strong><small>Verificación por Touch/Face ID</small></span></button>
        <button type="button" class="metodo-nuevo" data-ir="../ventas/cobro-tarjeta.html"><i class="fa-solid fa-circle-plus"></i> Agregar Nuevo Método de Pago</button>
      </div>
      <aside class="resumen-caja">
        <h2>RESUMEN DEL PEDIDO</h2>
        <div class="linea linea--item"><span><span data-render="piezas">0</span> artículo(s) en tu pedido</span><span data-render="subtotal">$0.00</span></div>
        <div class="linea"><span>Servicio Vending Tech</span><span data-render="servicio">$0.00</span></div>
        <div class="linea"><span>Impuestos (IVA 8%)</span><span data-render="iva">$0.00</span></div>
        <div class="total-caja"><div><small>TOTAL A PAGAR</small><strong data-render="total">$0.00</strong></div><i class="fa-solid fa-shield-halved"></i></div>
        <button type="button" class="btn-pagar" data-toast="Pago procesado correctamente" data-toast-tipo="success" data-ir="../catalogo.html"><span><i class="fa-solid fa-lock"></i> CONFIRMAR Y PAGAR<small>Con <span id="btn-metodo">Visa débito ••• 4821</span></small></span></button>
        ${btn('Regresar al carrito', { tipo: 'secondary', ir: 'carrito.html' })}
      </aside>
    </section>` });

/* =====================================================================
   VENTA DE SOUVENIRS Y COBRO
   ===================================================================== */
const SOUVENIRS = [['Taza UMAD', 180], ['Llavero Mundo a la Carta', 60], ['Playera', 250], ['Imán de recuerdo', 45], ['Postal', 25]];
const venta = (o) => pantalla({ modulo: 'ventas', nav: 'Roles', tipo: 'pagos', scripts: ['pantallas/pagos.js'], cssExtra: ['formulario'], ...o });

venta({ archivo: 'vender-souvenir.html', titulo: 'Vender y pagar<br>souvenirs', tituloPlano: 'Vender y pagar souvenirs',
  cuerpo: `    <form class="tarjeta-pantalla cobro-tarjeta" novalidate>
      <div class="cobro-grid">
        ${campo('Cliente *', 's(150)', { id: 'cliente', ph: 'Nombre del cliente', sinAyuda: true })}
        ${campo('Precio unitario (i)', 'double', { id: 'precio-unitario', v: '0.00', sinAyuda: true })}
        <div class="campo-grupo"><label for="souvenir">Souvenir <span class="req">*</span></label>
          <select class="input-custom" id="souvenir" name="souvenir" required><option value="" data-precio="0">Seleccione souvenir</option>${SOUVENIRS.map(([n, p]) => `<option data-precio="${p}">${esc(n)}</option>`).join('')}</select></div>
        ${campo('Subtotal (i)', 'double', { id: 'subtotal', v: '0.00', sinAyuda: true })}
        ${campo('Cantidad', 'int(3)', { id: 'cantidad', v: '1', sinAyuda: true })}
        ${campo('Cambio (i)', 'double', { id: 'cambio', v: '0.00', sinAyuda: true })}
        ${campo('Monto recibido', 'double', { id: 'monto-recibido', v: '0.00', sinAyuda: true })}
      </div>
      <div class="indicador" id="indicador-cambio"><i class="fa-solid fa-circle-info"></i><span>Captura el total a cobrar</span></div>
      ${acciones([btn('Pagar en efectivo', { ir: 'cobro-efectivo.html' }), btn('Pagar con tarjeta', { ir: 'cobro-tarjeta.html' }), btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' })])}
    </form>` });

venta({ archivo: 'cobro-efectivo.html', titulo: 'Cobro en<br>efectivo', tituloPlano: 'Cobro en efectivo',
  cuerpo: `    <form class="tarjeta-pantalla cobro-tarjeta" data-validar data-exito="Pago en efectivo registrado" data-ir="../catalogo.html" novalidate>
      <p class="etiqueta-metodo"><i class="fa-solid fa-money-bill-wave"></i> Pago en efectivo</p>
      <div class="cobro-grid" style="grid-template-columns:1fr">
        ${campo('Total a pagar', 'double', { id: 'total-pagar', v: '0.00', sinAyuda: true })}
        ${campo('Monto recibido', 'double', { id: 'monto-recibido', v: '0.00', sinAyuda: true })}
        ${campo('Cambio (i)', 'double', { id: 'cambio', v: '0.00', sinAyuda: true })}
      </div>
      <div class="indicador" id="indicador-cambio"><i class="fa-solid fa-circle-info"></i><span>Captura el total a cobrar</span></div>
      ${acciones([btn('Confirmar pago', { submit: true, id: 'btn-confirmar-pago', dis: true, attr: 'data-requiere-pago' }), btn('Regresar', { tipo: 'secondary', ir: 'back' })])}
    </form>` });

venta({ archivo: 'cobro-tarjeta.html', titulo: 'Cobro con<br>tarjeta', tituloPlano: 'Cobro con tarjeta',
  cuerpo: `    <form class="tarjeta-pantalla cobro-tarjeta" data-validar data-exito="Pago con tarjeta aprobado" data-ir="../catalogo.html" novalidate>
      <p class="etiqueta-metodo"><i class="fa-solid fa-credit-card"></i> Pago con tarjeta</p>
      <div class="cobro-grid">
        ${campo('Total a pagar *', 'double', { id: 'total-pagar', v: '0.00', sinAyuda: true })}
        ${campo('CVV *', 'int(4)', { id: 'cvv', ph: '•••', sinAyuda: true })}
        ${campo('Número de tarjeta *', 's(19)', { id: 'numero-tarjeta', ph: '•••• •••• •••• ••••', sinAyuda: true })}
        ${campo('Nombre del titular *', 's(100)', { id: 'titular', ph: 'Nombre Apellido', sinAyuda: true })}
        ${campo('Fecha de vencimiento *', 's(5)', { id: 'vencimiento', ph: 'MM/AA', sinAyuda: true })}
      </div>
      ${acciones([btn('Confirmar pago', { submit: true }), btn('Regresar', { tipo: 'secondary', ir: 'back' })])}
    </form>` });

/* =====================================================================
   COMANDAS (Mesero)
   ===================================================================== */
const com = (o) => pantalla({ modulo: 'comanda', hero: 'comanda', tipo: 'comanda', cssExtra: ['formulario'], ...o });
const CATEGORIAS = ['Bebidas', 'Mar y Tierra', 'Pastas', 'Pizzas', 'Sopas', 'Croisssants', 'Molletes', 'Tapas', 'Crepas', 'Paninos', 'Cafe', 'Cocteleria'];

const mesas = ['A', 'B', 'C'].flatMap((f) => [1, 2, 3, 4, 5, 6].map((n) => `<button type="button" class="mesa${f + n === 'B2' || f + n === 'C5' ? ' ocupada' : ''}"${f + n === 'B2' || f + n === 'C5' ? ' disabled' : ''}>${f}${n}</button>`)).join('\n        ');

com({ archivo: 'mesas.html', titulo: 'Mesas', tituloPlano: 'Mesas', scripts: ['pantallas/comanda.js'], heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla">
      <div class="mesas-cab"><span>MESAS</span><span>Mesero: <em style="color:#fdba74">Juan Pérez</em></span></div>
      <div class="mesas-grid">
        ${mesas}
      </div>
      <p class="aviso"><i class="fa-solid fa-circle-info"></i><span>Mesa seleccionada: <strong id="mesa-seleccionada">ninguna</strong>. Las mesas en gris están ocupadas.</span></p>
      ${acciones([btn('Abrir comanda', { id: 'btn-abrir-mesa', dis: true, ir: 'comanda-crear.html' })], 'acciones--fin')}
    </section>` });

const panelComanda = () => `    <section class="comanda-layout">
      <div class="panel-comanda">
        <div class="panel-comanda-cab"><span>Opciones de alimentos</span><span><button type="button" aria-label="Anterior">&lt;</button><button type="button" aria-label="Siguiente">&gt;</button></span></div>
        <div class="categorias">${CATEGORIAS.map((c) => `<button type="button" class="categoria">${c}</button>`).join('')}</div>
      </div>
      <div class="panel-comanda">
        <div class="comanda-tabla-caja">
          <table class="tabla-comanda"><thead><tr><th>Precio</th><th>Cantidad</th><th>Nombre</th><th>Eliminar</th></tr></thead><tbody id="lineas-comanda"></tbody></table>
        </div>
      </div>
    </section>
    <div class="comanda-pie">
      <span>Mesero: <em>Juan Pérez</em></span><span>Mesa: <em>A3</em></span><span>Total a pagar: <em id="total-comanda">$0.00</em></span>
      <span style="display:inline-flex;gap:.75rem;align-items:center">${btn('Cancelar comanda', { tipo: 'secondary', ir: 'cancelar-comanda.html' })}<button type="button" class="btn-confirmar" id="btn-confirmar-comanda" aria-label="Confirmar comanda"><i class="fa-solid fa-check"></i></button></span>
    </div>`;

com({ archivo: 'comanda-crear.html', titulo: 'Crear comanda', tituloPlano: 'Crear comanda', codigo: 'PA_09_01_01', scripts: ['pantallas/comanda.js'], heroCompacto: true, cuerpo: panelComanda() });

com({ archivo: 'comanda-cancelar-aviso.html', titulo: 'Cancelar comanda', tituloPlano: 'Cancelar comanda (aviso)', codigo: 'PA_09_02_01', scripts: ['pantallas/comanda.js'], heroCompacto: true,
  cuerpo: panelComanda(),
  extra: modal({ id: 'modal-cancelada', abierto: true, titulo: 'Se canceló la comanda', texto: 'La comanda fue cancelada. Continúa para ver el resumen de cancelación.',
    botones: [btn('CONTINUAR', { ir: 'comanda-cancelar-resumen.html' })] }) });

com({ archivo: 'comanda-cancelar-resumen.html', titulo: 'Resumen de cancelación', tituloPlano: 'Resumen de cancelación', codigo: 'PA_09_02_01', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla resumen-cancelacion">
      <dl class="lista-dl" style="margin:0">
        <div><dt>Fecha</dt><dd>15/05/2026</dd></div><div><dt>Folio</dt><dd>0001024</dd></div><div><dt>Mesa</dt><dd>A3</dd></div>
        <div><dt>Motivo de cancelación</dt><dd>Cliente se retiró</dd></div><div><dt>Alimentos</dt><dd>Panino de Milanesa</dd></div>
        <div><dt>Detalle de alimentos</dt><dd>Sin cebolla</dd></div><div><dt>Cantidad</dt><dd>1</dd></div>
      </dl>
      ${acciones([btn('Confirmar', { ir: 'comanda-crear.html', toast: 'Cancelación confirmada', toastTipo: 'success' })], 'acciones--fin')}
      <p class="aviso"><i class="fa-solid fa-circle-info"></i><span>Para capturar el motivo, cantidad y contraseña de gerente usa <a href="cancelar-comanda.html">Cancelar comanda (formulario)</a>.</span></p>
    </section>` });

/* =====================================================================
   COMPRAS Y DEVOLUCIONES
   ===================================================================== */
const cmp = (o) => pantalla({ modulo: 'compras', tipo: 'compras', cssExtra: ['formulario'], ...o });
const ARTICULOS = [['Taza UMAD', 180, 'Vigente'], ['Llavero Mundo a la Carta', 60, 'Vigente'], ['Playera', 250, 'Vigente'], ['Harina de trigo', 28, 'n.a.'], ['Aceite de oliva', 120, 'n.a.'], ['Jamón serrano', 310, 'n.a.']];
const filaCompra = `<tr><td><select class="input-custom" aria-label="Tipo de producto"><option>Souvenir</option><option>Ingrediente</option></select></td>
        <td><select class="input-custom articulo" aria-label="Artículo">${ARTICULOS.map(([n, p, e]) => `<option data-precio="${p}" data-estado="${e}">${esc(n)}</option>`).join('')}</select></td>
        <td class="estado">Vigente</td><td><input class="input-custom cantidad" type="text" inputmode="numeric" maxlength="2" value="0" aria-label="Cantidad" style="width:4rem"></td>
        <td class="num precio">0.00</td><td class="num sub">0.00</td><td><button type="button" class="quitar" aria-label="Quitar"><i class="fa-solid fa-xmark"></i></button></td></tr>`;

cmp({ archivo: 'registrar-compra.html', nav: 'Compras', titulo: 'Registrar compra', tituloPlano: 'Registrar compra', codigo: 'CU_11', scripts: ['pantallas/compras.js'], heroCompacto: true,
  cuerpo: `    <form data-validar data-exito="Compra registrada correctamente" data-ir="../catalogo.html" novalidate>
      <p class="panel-sub">CU_11 · Compra de souvenirs e ingredientes. Elige un proveedor y agrega souvenirs, ingredientes o ambos.</p>
      <div class="compra-layout">
        <section class="tarjeta-pantalla">
          <h2 class="panel-titulo">Información de la compra</h2>
          <p class="panel-sub">Completa los datos generales de la orden.</p>
          <div class="panel-campos">
            ${campo('Proveedor *', 's(15)', { id: 'proveedor', sel: ['Artesanías Puebla', 'Distribuidora Gourmet', 'Importadora del Sur'], ph: 'Selecciona un proveedor activo', sinAyuda: true })}
            ${campo('Estado del proveedor (i)', 'bool', { id: 'estado-proveedor', v: true })}
            ${campo('Fecha de compra *', 'date', { sinAyuda: true })}
            ${campo('Fecha y hora de registro (i)', 's(20)', { id: 'registro', v: 'dd/mm/aaaa hh:mm', sinAyuda: true })}
            ${campo('Folio de orden (i)', 'int(10)', { id: 'folio-orden', v: 'Automático', sinAyuda: true })}
            ${campo('Estado de orden (i)', 's(15)', { id: 'estado-orden', v: 'Emitida', sinAyuda: true })}
            ${campo('Observaciones (opcional)', 'ta(150)', { id: 'observaciones', ph: 'Escribe una nota (opcional)' })}
          </div>
        </section>
        <section class="tarjeta-pantalla">
          <h2 class="panel-titulo">Productos de la orden</h2>
          <p class="panel-sub">Los souvenirs deben estar vigentes. Puedes agregar productos de ambos tipos.</p>
          <table class="tabla-edicion"><thead><tr><th>Tipo de producto</th><th>Artículo</th><th>Estado (i)</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead>
            <tbody id="lineas-compra">${filaCompra}</tbody></table>
          ${acciones([btn('Agregar artículo', { tipo: 'ghost', id: 'agregar-linea', icono: 'fa-circle-plus' })], '')}
          <div class="total-compra"><span>Total de la compra</span><strong id="total-compra">$0.00</strong></div>
        </section>
      </div>
      ${acciones([btn('Guardar compra', { submit: true }), btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' })], 'acciones--fin')}
    </form>` });

const ordenCabecera = `<div class="datos-orden"><div class="dato"><small>Folio (i)</small><strong>OC-2026-0148</strong></div><div class="dato"><small>Fecha (i)</small><strong>08/10/2026</strong></div>
        <div class="dato"><small>Proveedor (i)</small><strong>Artesanías Puebla</strong></div><div class="dato"><small>Estado</small><strong><span class="insignia">Emitida</span></strong></div></div>`;

cmp({ archivo: 'devolucion-compra-buscar.html', nav: 'Souvenir', titulo: 'Devolución de compra<br>de souvenirs', tituloPlano: 'Devolución de compra de souvenirs', heroCompacto: true,
  cuerpo: `    <form class="tarjeta-pantalla" style="max-width:640px;margin:0 auto" data-validar data-exito="Orden encontrada" data-ir="devolucion-compra-datos.html" novalidate>
      <h2 class="panel-titulo">Buscar orden de compra</h2>
      <p class="panel-sub">Ingresa el folio para consultar si la orden está registrada y lista para devolución.</p>
      <div class="buscar-clave">
        <input class="input-custom" type="text" id="folio" name="folio" value="OC-2026-0148" maxlength="15" aria-label="Folio de la orden" required>
        ${btn('Buscar', { submit: true, icono: 'fa-magnifying-glass' })}
      </div>
      <small class="ayuda">El folio debe corresponder a una compra de souvenirs.</small>
    </form>` });

cmp({ archivo: 'devolucion-compra-datos.html', nav: 'Souvenir', titulo: 'Datos de la orden', tituloPlano: 'Devolución de compra · Datos de la orden', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla">
      <p class="panel-sub">Verifica los datos antes de completar la devolución.</p>
      ${ordenCabecera}
      <table class="tabla-datos"><thead><tr><th>Souvenir (i)</th><th>Cantidad (i)</th><th class="num">Precio unitario (i)</th><th class="num">Subtotal (i)</th></tr></thead>
        <tbody><tr><td>Taza UMAD</td><td>2</td><td class="num">$180.00</td><td class="num">$360.00</td></tr></tbody></table>
      <p class="total-orden">Total de la orden: $360.00</p>
      ${acciones([btn('Regresar', { tipo: 'secondary', ir: 'devolucion-compra-buscar.html' }), btn('Confirmar devolución', { modal: 'modal-confirmar' })], 'acciones--fin')}
    </section>`,
  extra: modal({ id: 'modal-confirmar', titulo: '¿Confirmas la devolución?', texto: 'La orden OC-2026-0148 cambiará a estado <strong>Devuelta</strong> y la transacción será registrada.',
    botones: [btn('Regresar', { tipo: 'secondary', cerrar: true }), btn('Confirmar', { ir: 'devolucion-compra-completada.html' })] }) });

cmp({ archivo: 'devolucion-compra-completada.html', nav: 'Souvenir', titulo: 'Devolución completada', tituloPlano: 'Devolución completada', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla estado-final">
      <span class="icono"><i class="fa-solid fa-check"></i></span>
      <h2>Devolución realizada correctamente</h2>
      <p class="panel-sub">La transacción quedó realizada y ahora tiene el estado Devuelta.</p>
      <div class="datos-orden"><div class="dato"><small>Folio (i)</small><strong>OC-2026-0148</strong></div><div class="dato"><small>Folio de devolución (i)</small><strong>DEV-2026-0001</strong></div>
        <div class="dato"><small>Estado</small><strong><span class="insignia insignia--ok">Devuelta</span></strong></div><div class="dato"><small>Fecha y hora (i)</small><strong>08/10/2026 - 11:42</strong></div>
        <div class="dato"><small>Total devuelto (i)</small><strong>$360.00</strong></div></div>
      ${acciones([btn('Nueva búsqueda', { ir: 'devolucion-compra-buscar.html' })], 'acciones--centro')}
    </section>` });

/* ---------- Devolución de ventas (CU_14_01) ---------- */
const camposTicket = (extra = {}) => `<div class="form-grid">
        ${render([
    ['Fecha y hora de venta (i)', 's(50)', { v: '08/10/2026 10:15', id: 'fecha-venta' }], ['Estado del ticket (i)', 's(20)', { v: 'Pagado', id: 'estado-ticket' }],
    ['Vendedor (i)', 's(20)', { v: 'Luis Ramírez' }], ['Método de pago (i)', 's(20)', { v: 'Tarjeta', id: 'metodo-pago' }],
    ['Souvenir (i)', 's(100)', { v: 'Taza de talavera' }], ['Cantidad (i)', 'int(4)', { v: '2' }],
    ['Precio unitario (i)', 'd(12,2)', { v: '725.00' }], ['Subtotal (i)', 'd(12,2)', { v: '1250.00' }],
    ['IVA (i)', 'd(12,2)', { v: '200.00' }], ['Monto a reembolsar (i)', 'd(12,2)', { v: '1450.00' }],
    ['Observaciones (i)', 's(200)', { v: 'Sin observaciones', ancho: true }],
    ['Motivo de la devolución *', 's(150)', { id: 'motivo', ancho: true }],
  ].map(([l, t, o]) => [l, t, { sinAyuda: true, ...o, ...extra }]))}
      </div>`;

const dev = (o) => cmp({ nav: 'Roles', ...o });

dev({ archivo: 'devolucion-venta-buscar.html', titulo: 'Devolución de ventas<br>de souvenirs', tituloPlano: 'Devolución de ventas de souvenirs', codigo: 'CU_14_01', heroCompacto: true,
  cuerpo: `    <form class="tarjeta-pantalla" data-validar data-exito="Solicitud de devolución enviada a autorización" data-ir="devolucion-venta-autorizar.html" novalidate>
      <div class="buscar-clave">
        ${campo('Folio del ticket *', 's(12)', { id: 'folio-ticket', v: '214589', sinAyuda: true })}
        <button type="button" class="btn-primary" style="align-self:flex-end" data-toast="Ticket encontrado" data-toast-tipo="success"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
      </div>
      ${camposTicket()}
      ${acciones([btn('Devolver', { submit: true }), btn('Regresar', { tipo: 'secondary', ir: '../catalogo.html' })])}
    </form>` });

const datosDev = (estado, clase, extra) => `<dl class="lista-dl">
          <div><dt>Folio de devolución</dt><dd>D-2023-000451</dd></div><div><dt>Folio de venta original</dt><dd>214589</dd></div>
          <div><dt>Cliente</dt><dd>María González</dd></div><div><dt>Souvenir y cantidad</dt><dd>Taza de talavera × 2</dd></div>
          <div><dt>Motivo de la devolución</dt><dd>Producto con defecto de fábrica</dd></div><div><dt>Fecha de venta</dt><dd>08/10/2026</dd></div>
          <div><dt>Monto a reembolsar</dt><dd>$1,450.00 MXN</dd></div><div><dt>Forma de reembolso</dt><dd>Tarjeta (misma de la venta)</dd></div>
          ${extra || ''}
          <div><dt>Estado actual</dt><dd><span class="insignia ${clase}">${estado}</span></dd></div></dl>`;

dev({ archivo: 'devolucion-venta-autorizar.html', titulo: 'Autorizar o rechazar<br>devolución', tituloPlano: 'Autorizar o rechazar devolución', codigo: 'CU_14_01_01', heroCompacto: true, scripts: ['pantallas/devolucion.js'],
  cuerpo: `    <section class="tarjeta-pantalla">
      <div class="banda-estado banda-estado--pendiente">Estado: Pendiente de dictamen</div>
      <div class="dictamen">
        ${datosDev('Pendiente', '', '<div><dt>Estado del souvenir</dt><dd>Bueno · se reintegra al inventario</dd></div><div><dt>Autorizado por</dt><dd>Luis Ramírez · Administrador</dd></div>')}
        <div>${campo('Observaciones (obligatorio al rechazar)', 'ta(250)', { id: 'observaciones-dictamen', ph: 'Describe el dictamen', ancho: true })}</div>
      </div>
      ${acciones([btn('Autorizar', { ir: 'devolucion-venta-autorizada.html', toast: 'Devolución autorizada', toastTipo: 'success' }), btn('Rechazar', { tipo: 'danger', id: 'btn-rechazar', attr: 'data-destino="devolucion-venta-rechazada.html"' }), btn('Regresar', { tipo: 'secondary', ir: 'devolucion-venta-buscar.html' })])}
    </section>` });

dev({ archivo: 'devolucion-venta-autorizada.html', titulo: 'Devolución autorizada', tituloPlano: 'Devolución autorizada', codigo: 'CU_14_01_02', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla">
      <div class="banda-estado banda-estado--ok"><i class="fa-solid fa-circle-check"></i> Devolución autorizada</div>
      ${datosDev('Autorizada', 'insignia--ok', '<div><dt>Autorizado por</dt><dd>Luis Ramírez · Administrador</dd></div><div><dt>Reintegro a inventario</dt><dd>Sí · estado bueno</dd></div>')}
      ${acciones([btn('Imprimir comprobante', { tipo: 'secondary', icono: 'fa-print', attr: 'onclick="window.print()"' }), btn('Regresar al listado', { ir: 'devolucion-venta-buscar.html' })], 'acciones--fin')}
    </section>` });

dev({ archivo: 'devolucion-venta-rechazada.html', titulo: 'Devolución rechazada', tituloPlano: 'Devolución rechazada', codigo: 'CU_14_01_03', heroCompacto: true,
  cuerpo: `    <section class="tarjeta-pantalla">
      <div class="banda-estado banda-estado--mal"><i class="fa-solid fa-circle-xmark"></i> Devolución rechazada</div>
      ${datosDev('Rechazada', 'insignia--mal', '<div><dt>Rechazado por</dt><dd>Luis Ramírez · Administrador</dd></div><div><dt>Reintegro a inventario</dt><dd>No · devolución rechazada</dd></div>')}
      ${acciones([btn('Regresar al listado', { ir: 'devolucion-venta-buscar.html' })], 'acciones--fin')}
    </section>` });
