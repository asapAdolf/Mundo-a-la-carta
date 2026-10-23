# Mundo a la Carta – Frontend del Sistema

Frontend estático basado en `pantallas.pdf`, con `index.html` como pantalla principal de **Login / Cuenta** y el resto de vistas, hojas de estilo y scripts organizados en sus carpetas correspondientes.

## Uso

```bash
npm start     # Inicia el servidor en http://localhost:3000 (abre Login en index.html)
npm run build # Regenera index.html, vistas/<modulo>/*.html y js/pantallas-indice.js
npm run verify # Verifica que todos los enlaces internos existan
```

## Estructura del proyecto

```text
pantallas/
├── index.html                        # Pantalla de Login / Cuenta (entrada principal)
├── package.json
├── server.js                         # Servidor HTTP local sin dependencias
├── iniciar.bat / iniciar.sh          # Scripts de arranque rápido
├── pantallas.pdf                     # Prototipo base de pantallas
├── css/
│   ├── styles.css                    # Variables, botones, inputs, modales y toasts base
│   ├── layout.css                    # Encabezado común, navegación, buscador y pie
│   └── pantallas/                    # CSS separado por tipo de pantalla
│       ├── auth.css                  # Login, acceso y registro
│       ├── cancelar-comanda.css      # Cancelar comanda con contraseña de gerente
│       ├── carta.css                 # Carta de alimentos/bebidas y carrito
│       ├── catalogo.css              # Catálogo general de pantallas
│       ├── comanda.css               # Mesas y comandas (rol Mesero)
│       ├── compras.css               # Compras y devoluciones (CU_11, CU_12, CU_14)
│       ├── formulario.css            # Formularios CRUD (usuarios, souvenirs, roles, transporte)
│       ├── pagos.css                 # Checkout, cobro en efectivo/tarjeta y venta de souvenirs
│       └── reservas.css              # Reservaciones, recepciones, inmersiones y recibo
├── js/
│   ├── comun.js                      # Navegación, validación, modales, buscador y toasts
│   ├── carrito.js                    # Estado del carrito en localStorage
│   ├── pantallas-indice.js           # Índice autogenerado para el buscador
│   ├── empleados/                    # Módulos del gestor de empleados (estado y reglas RN)
│   │   ├── app.js
│   │   ├── empleados.js
│   │   ├── rules.js
│   │   ├── state.js
│   │   └── ui.js
│   └── pantallas/                    # Scripts específicos por tipo de pantalla
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
    ├── auth/                         # Acceso e inicio/creación de cuenta
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
