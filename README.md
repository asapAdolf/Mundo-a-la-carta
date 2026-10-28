# Mundo a la Carta – Frontend del Sistema

Frontend estático basado en `pantallas.pdf`. `index.html` es el **Inicio / Catálogo público** y `vistas/admin/dashboard.html` el **Panel administrativo**. La estructura completa (sitemap, layout de cada área y paginación) está en [`docs/estructura-sitio.md`](docs/estructura-sitio.md).

## Uso

```bash
npm start     # Inicia el servidor en http://localhost:3000 (abre el Inicio público)
npm run build # Regenera index.html, vistas/<modulo>/*.html y js/pantallas-indice.js
npm run verify # Verifica que todos los enlaces internos existan
```

> ⚠️ `npm run build` regenera las vistas desde `tools/` y **sobrescribe** los cambios hechos a mano en `vistas/`
> (comentarios RN de transporte, scripts de funcionalidad, campos de contraseña del registro). No lo ejecutes
> hasta sincronizar el generador.

## Funcionamiento como sitio activo

Todas las pantallas guardan y leen datos reales a través de `js/datos.js` (`MC.datos`). Mientras no exista la base de
datos, la información vive en el `localStorage` del navegador y se siembra con datos de ejemplo la primera vez.

### Cuentas de prueba

Personal: `vistas/auth/acceso-personal.html` (o *Acceso del personal* en el menú). Clientes: *Iniciar sesión* en el navbar.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador (acceso a todo) |
| `gerente` | `gerente123` | Gerente (autoriza cancelaciones de comandas) |
| `mesero` | `mesero123` | Mesero |
| `ventas` | `ventas123` | Empleado de ventas |
| `juan.perez@email.com` (o cualquier correo de cliente) | `cliente123` | Cliente |

- Sin sesión se puede ver el Inicio, la carta y las páginas de acceso; las demás redirigen al login de su área y regresan a la página solicitada.
- Los clientes solo acceden al área pública (carta, carrito, pagos y sus propias reservaciones); el personal entra al Panel y ve los módulos de su rol.
- "Cerrar sesión" aparece en el menú ☰. Para reiniciar los datos de ejemplo: `MC.datos.reiniciar()` en la consola del navegador.

### Flujos principales

- **CRUD** (usuarios, souvenirs, roles, transporte): las pantallas de modificar, baja y consulta muestran un listado con búsqueda y
  paginación; el registro elegido viaja en `?folio=`. Bajas temporales (reactivables) y definitivas; transporte aplica RN_185, RN_189,
  RN_190, RN_193, RN_194, RN_195, RN_196, RN_197 y RN_201.
- **Reservación**: alta → disponibilidad (fecha y sala libre según horario y capacidad) → resumen → recibo. Cancelar con 2 días o más
  de anticipación lleva a la devolución; con menos se aplica la multa del 15 %.
- **Recepción / inmersión**: se registran sobre el folio de una reservación activa.
- **Carta**: carrito → checkout (o tarjeta nueva) → pedido guardado.
- **Venta de souvenirs**: valida existencias → cobro en efectivo/tarjeta → ticket; la devolución del ticket pasa por autorización y
  reintegra el inventario.
- **Comandas**: mesas → comanda → enviar a cocina → cobrar (libera la mesa). Quitar alimentos ya enviados requiere la contraseña de un gerente.
- **Compras**: registrar orden (aumenta existencias) → devolución de la orden al proveedor.

### Para el equipo de Base de Datos

Las pantallas solo usan las funciones de `MC.datos`, que devuelven Promesas. Para conectar el backend basta con reemplazar el
adaptador de `js/datos.js` por llamadas `fetch` con este contrato:

| Función | Endpoint sugerido |
|---|---|
| `listar(coleccion, { q, pagina, porPagina, filtro })` → `{ items, total, pagina, paginas }` | `GET /api/<coleccion>?q=&pagina=&porPagina=` |
| `obtener(coleccion, folio)` | `GET /api/<coleccion>/<folio>` |
| `crear(coleccion, datos)` → registro con `folio` | `POST /api/<coleccion>` |
| `actualizar(coleccion, folio, cambios)` | `PATCH /api/<coleccion>/<folio>` |
| `eliminar(coleccion, folio)` | `DELETE /api/<coleccion>/<folio>` |

Colecciones: `usuarios`, `souvenirs`, `empleados`, `transporte`, `reservaciones`, `recepciones`, `inmersiones`, `ventas`, `pedidos`,
`comandas`, `mesas`, `compras`, `devoluciones`. Los nombres de los campos son los `id` de los inputs de cada vista; los formatos de
folio y los datos de ejemplo están en `semilla()` de `js/datos.js`. Las contraseñas se guardan en texto plano solo en esta maqueta:
el backend debe almacenarlas con hash y validar el login del lado del servidor.

## Estructura del proyecto

```text
pantallas/
├── index.html                        # Inicio / Catálogo público (entrada principal)
├── docs/estructura-sitio.md          # Sitemap, layout público/admin y paginación
├── package.json
├── server.js                         # Servidor HTTP local sin dependencias
├── iniciar.bat / iniciar.sh          # Scripts de arranque rápido
├── pantallas.pdf                     # Prototipo base de pantallas
├── css/
│   ├── styles.css                    # Variables, botones, inputs, modales y toasts base
│   ├── layout.css                    # Encabezado común, navegación, buscador y pie
│   └── pantallas/                    # CSS separado por tipo de pantalla
│       ├── admin.css                 # Panel administrativo (sidebar, indicadores)
│       ├── auth.css                  # Login, acceso y registro
│       ├── cancelar-comanda.css      # Cancelar comanda con contraseña de gerente
│       ├── carta.css                 # Carta de alimentos/bebidas y carrito
│       ├── catalogo.css              # Catálogo general de pantallas
│       ├── comanda.css               # Mesas y comandas (rol Mesero)
│       ├── compras.css               # Compras y devoluciones (CU_11, CU_12, CU_14)
│       ├── formulario.css            # Formularios CRUD (usuarios, souvenirs, roles, transporte)
│       ├── inicio.css                # Inicio / catálogo público
│       ├── pagos.css                 # Checkout, cobro en efectivo/tarjeta y venta de souvenirs
│       └── reservas.css              # Reservaciones, recepciones, inmersiones y recibo
├── js/
│   ├── datos.js                      # Capa de datos (MC.datos): localStorage hoy, API/BD después
│   ├── comun.js                      # Navegación, sesión, validación, listado paginado, modales y toasts
│   ├── carrito.js                    # Estado del carrito en localStorage
│   ├── pantallas-indice.js           # Índice autogenerado para el buscador
│   ├── empleados/                    # Módulos del gestor de empleados (estado y reglas RN)
│   │   ├── app.js
│   │   ├── empleados.js
│   │   ├── rules.js
│   │   ├── state.js
│   │   └── ui.js
│   └── pantallas/                    # Scripts específicos por tipo de pantalla
│       ├── acceso.js                 # Login y registro
│       ├── crud.js                   # Altas, cambios, bajas y consultas genéricas
│       ├── dashboard.js              # Indicadores y listados del panel
│       ├── inicio.js                 # Catálogo público filtrable y paginado
│       ├── cobro.js                  # Carrito, checkout, venta de souvenirs y cobros
│       ├── cancelar-comanda.js
│       ├── carta.js
│       ├── comanda.js
│       ├── compras.js
│       ├── devolucion.js
│       ├── pagos.js
│       └── reservas.js
├── tools/                            # Generador y validador de pantallas
│   ├── generar-pantallas.js
│   ├── lib.js
│   ├── pantallas-operacion.js
│   ├── pantallas-reservas.js
│   ├── escribir.js
│   └── verificar-enlaces.js
└── vistas/                           # Vistas HTML organizadas por módulo
    ├── catalogo.html                 # Catálogo general de las 55 pantallas
    ├── admin/                        # Panel administrativo (dashboard)
    ├── auth/                         # Acceso de clientes, registro y acceso del personal
    ├── usuarios/                     # Alta, modificación, baja y consulta de usuarios
    ├── souvenirs/                    # Alta, modificación, baja y consulta de souvenirs
    ├── empleados/                    # Roles/empleados (vistas individuales + SPA interactiva)
    ├── transporte/                   # Alta, modificación, baja y consulta de unidades
    ├── reservas/                     # Reservaciones, disponibilidad, recepciones, inmersiones y recibo
    ├── carta/                        # Carta, carrito de compra y checkout
    ├── ventas/                       # Venta de souvenirs y cobro en efectivo/tarjeta
    ├── comandas/                     # Mesas, crear comanda y flujo de cancelación
    └── compras/                      # Registro de compras y devoluciones de compras/ventas
```
