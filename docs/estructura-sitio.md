# Mundo a la Carta – Estructura del sitio

Documento de referencia para el equipo: mapa del sitio, layout y navegación de cada área y reglas de
paginación. Lo descrito aquí ya está implementado en el proyecto (ver rutas entre paréntesis).

---

## 1. Mapa del sitio (Sitemap)

El sitio tiene **dos áreas** con layout propio. La regla que decide a qué área pertenece cada vista vive en
`js/comun.js` (`MC.area`) y en el atributo `data-area` del `<body>`.

### 1.1 Área pública (lo que ve el cliente)

```text
/ (index.html) ─────────────── Inicio / Catálogo  [sin sesión]
├── Catálogo ?tipo=Experiencia|Carta|Souvenir&q=&orden=&pagina=
├── Carta ──────────────────── vistas/carta/carta.html            [sin sesión]
│   ├── Carrito ────────────── vistas/carta/carrito.html          [cliente]
│   └── Checkout ───────────── vistas/carta/checkout.html         [cliente]
│       └── Pago con tarjeta ─ vistas/ventas/cobro-tarjeta.html   [cliente]
├── Reservar ───────────────── vistas/reservas/reservacion-crear.html        [cliente]
│   ├── Disponibilidad ─────── vistas/reservas/disponibilidad.html
│   ├── Resumen ────────────── vistas/reservas/reservacion-resumen.html
│   └── Recibo ─────────────── vistas/reservas/recibo-reserva.html?folio=
├── Mis reservaciones ──────── vistas/reservas/reservacion-consultar.html    [cliente]
│   ├── Modificar ──────────── vistas/reservas/reservacion-modificar.html?folio=
│   └── Cancelar ───────────── vistas/reservas/reservacion-cancelar.html?folio=
│       └── Devolución ─────── vistas/reservas/reservacion-cancelar-devolucion.html?folio=
└── Cuenta
    ├── Iniciar sesión ─────── vistas/auth/acceso-login.html      [sin sesión]
    ├── Crear cuenta ───────── vistas/auth/acceso-registro.html   [sin sesión]
    └── Acceso del personal ── vistas/auth/acceso-personal.html   [sin sesión]
```

### 1.2 Área privada (Dashboard administrativo)

Requiere sesión de **empleado**. Si un cliente intenta entrar, se le regresa al inicio. Cada módulo entra por
su **listado** (consulta paginada) y desde ahí se navega a alta / modificación / baja con `?folio=`.

```text
Panel ──────────────────────── vistas/admin/dashboard.html
├── Reservas
│   ├── Reservaciones ──────── vistas/reservas/reservacion-*.html
│   ├── Recepciones ────────── vistas/reservas/recepcion-*.html
│   └── Inmersiones ────────── vistas/reservas/inmersion-*.html
├── Operación
│   ├── Mesas y comandas ───── vistas/comandas/mesas.html → comanda-crear.html?mesa= → cancelar-comanda.html
│   ├── Venta de souvenirs ─── vistas/ventas/vender-souvenir.html → cobro-efectivo | cobro-tarjeta
│   └── Transporte ─────────── vistas/transporte/transporte-{consulta,crear,modificar,baja}.html
├── Inventario y compras
│   ├── Souvenirs ──────────── vistas/souvenirs/souvenir-{consulta,crear,modificar,baja}.html
│   ├── Compras ────────────── vistas/compras/registrar-compra.html
│   ├── Devolución de compras  vistas/compras/devolucion-compra-{buscar,datos,completada}.html
│   └── Devolución de ventas ─ vistas/compras/devolucion-venta-{buscar,autorizar,autorizada,rechazada}.html
└── Administración
    ├── Clientes ───────────── vistas/usuarios/usuario-{consulta,crear,modificar,baja}.html
    ├── Empleados y roles ──── vistas/empleados/rol-{consulta,crear,modificar,baja}.html
    └── Catálogo de pantallas  vistas/catalogo.html (índice técnico, solo Administrador)
```

### 1.3 Permisos por rol en el panel

| Módulo | Administrador | Gerente | Empleado (ventas) | Mesero |
|---|:-:|:-:|:-:|:-:|
| Panel | ✔ | ✔ | ✔ | ✔ |
| Reservaciones / recepciones / inmersiones | ✔ | ✔ | ✔ | |
| Mesas y comandas | ✔ | ✔ | | ✔ |
| Venta y devolución de souvenirs | ✔ | ✔ | ✔ | |
| Souvenirs | ✔ | ✔ | ✔ | |
| Transporte, compras, devolución de compras, clientes | ✔ | ✔ | | |
| Empleados y roles, catálogo de pantallas | ✔ | | | |

Se controla con `data-roles="Administrador Gerente ..."` en enlaces y botones. Hoy solo **oculta** opciones del
menú; cuando exista backend, **el servidor debe validar el rol en cada petición**.

---

## 2. Layout y navegación

Ambas áreas comparten la tarjeta `.app`, el encabezado `hero bg-wave` con la onda, el buscador y el menú ☰.
Cambian el contenido del navbar, el menú y el footer.

### 2.1 Área pública

**Navbar** (`.topbar`):

| Zona | Contenido |
|---|---|
| Izquierda | Marca *MUNDO A LA CARTA* → Inicio |
| Centro (`.nav-principal`) | Inicio · Experiencias · Carta · Reservar · Contacto (con `aria-current="page"` en la sección activa) |
| Derecha (`.topbar-acciones`) | Buscar · Carrito con contador · **Iniciar sesión** (con sesión cambia a *Mi cuenta: nombre*) · Menú ☰ |
| Menú ☰ | Inicio, Experiencias, Carta, Mi carrito, Reservar, Mis reservaciones, Iniciar sesión, Crear cuenta, Acceso del personal y *Cerrar sesión* si hay sesión |

**Footer** (`.pie-sitio`, ancla `#contacto`): cuatro columnas (marca y descripción · Explora · Tu cuenta ·
Contacto y horario) y una franja legal con © y el código de la pantalla. En celular pasa a dos columnas.

### 2.2 Área administrativa

**Navbar**:

| Zona | Contenido |
|---|---|
| Izquierda | Marca → Panel |
| Centro | **Panel** · *Módulo actual* (activo) · **Sitio público** |
| Derecha | Buscar pantalla · chip con el nombre del usuario · Menú ☰ |
| Menú ☰ | Todos los módulos del panel (mismo orden que el sidebar), catálogo de pantallas, ir al sitio público y cerrar sesión |

**Sidebar** (solo en el Panel, `.admin-lateral`): saludo con nombre y rol y los módulos agrupados en General,
Reservas, Operación, Inventario y compras y Administración, filtrados por rol. En celular se convierte en una
fila de enlaces arriba del contenido. Las pantallas de módulo conservan su barra lateral de acciones
(crear / modificar / baja / consulta).

**Footer** (`.pie-admin`): una línea con *© Mundo a la Carta · Panel administrativo*, el código de la pantalla
y el usuario en sesión.

### 2.3 Reglas de navegación

1. La marca siempre lleva al inicio de su área (Inicio o Panel).
2. "Regresar" en un módulo lleva al Panel; en el área pública, al Inicio.
3. Un registro seleccionado viaja en la URL (`?folio=`), así un enlace abre exactamente ese registro.
4. Sin sesión, una página protegida redirige al login de su área con `?volver=` y regresa ahí al iniciar sesión.
5. Los flujos de varias pantallas (reservar, cobrar, cancelar comanda) guardan su avance en `sessionStorage`
   para que *Regresar* no pierda lo capturado.

---

## 3. Paginación y listados

Se usa un componente único (`MC.paginador` y `MC.rangoPagina` en `js/comun.js`) con el estilo `.paginacion`.

### 3.1 Catálogo público (`index.html`, `js/pantallas/inicio.js`)

- **Paginación numerada**, no scroll infinito: el cliente puede volver a una página, compartirla y el footer
  sigue siendo alcanzable.
- **8 tarjetas por página** (2 filas de 4 en escritorio; el grid baja a 3, 2 y 1 columnas).
- **El estado vive en la URL**: `?tipo=&q=&orden=&pagina=`. La URL se puede recargar y compartir, y los
  buscadores pueden indexarla.
- Cambiar de página agrega una entrada al historial (`pushState`), así *Atrás* regresa a la página anterior.
  Los filtros reemplazan la entrada actual (`replaceState`) para no llenar el historial.
- **Todo filtro o búsqueda nueva regresa a la página 1.** Una página fuera de rango se ajusta a la última.
- La búsqueda espera 250 ms antes de filtrar (*debounce*) e ignora acentos y mayúsculas.
- Siempre se muestra "Mostrando 9–16 de 28", y si no hay resultados, un mensaje con *Limpiar filtros*.
- Al cambiar de página se desplaza al inicio del catálogo.

### 3.2 Tablas del administrador (`MC.listado`)

- **5 registros por página** en módulos y en el Panel, con búsqueda por folio, nombre y campos clave.
- El orden debe ser **estable**: por fecha y hora, o por folio. Sin un orden fijo, los registros "saltan" entre páginas.
- Si la URL trae `?folio=`, el listado abre en la página donde está ese registro y lo resalta.
- Botones accesibles: anterior / siguiente deshabilitados en los extremos, `aria-current="page"` en la página
  actual y una ventana de páginas con elipsis (`1 … 4 5 6 … 20`) para tablas grandes.
- Cada fila tiene acciones directas (consultar, modificar, baja) y un clic en la fila selecciona el registro.

### 3.3 Cuando exista la base de datos

La paginación debe hacerse **en el servidor**, nunca descargando la tabla completa:

| Parámetro | Uso |
|---|---|
| `pagina` (≥ 1) y `porPagina` | Con un tope máximo (p. ej. 50) para evitar consultas enormes |
| `q`, filtros | Se aplican **antes** de contar y paginar |
| `orden` | Lista blanca de columnas permitidas, más el folio como desempate |
| Respuesta | `{ items, total, pagina, paginas, porPagina }`: el mismo formato que ya devuelve `MC.datos.listar` |

- La consulta debe hacer `ORDER BY` + `OFFSET/LIMIT` (o `Skip/Take`) y un `COUNT` con los mismos filtros.
- Se deben crear índices en las columnas de búsqueda y orden (folio, fecha, nombre, estado).
- Para tablas muy grandes (historial de ventas o comandas) conviene la paginación por cursor
  (`WHERE folio > :ultimo`) en lugar de `OFFSET`.
- La lista debe devolver solo las columnas que muestra, no el registro completo.
