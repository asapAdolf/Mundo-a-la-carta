# Sistema de Gestión de Empleados - Mundo a la Carta (JavaScript Modular)

Este proyecto es una arquitectura web modular en JavaScript basada en el prototipo interactivo de pantallas (`pantallas.html`).

---

## 📁 Estructura del Proyecto

```text
proyecto-js/
├── index.html              # Punto de entrada HTML (Vista principal SPA)
├── package.json            # Metadatos del proyecto y scripts
├── README.md               # Documentación técnica
├── css/
│   └── styles.css          # Estilos propios, micro-interacciones, modales y animaciones
└── js/
    ├── app.js              # Controlador principal y enlace de eventos del DOM
    ├── state.js            # Estado reactivo, base de datos simulada y folios automáticos
    ├── rules.js            # Catálogo de Reglas de Negocio (RN) y Direccionamiento de Botones
    ├── empleados.js        # Lógica de negocio y operaciones CRUD (Altas, Modificaciones, Bajas)
    └── ui.js               # Renderizado del DOM, transición de pantallas, widgets y modales
```

---

## 🚀 Cómo Ejecutar el Proyecto

Puedes ejecutarlo directamente en tu navegador o mediante un servidor de desarrollo:

### Opción 1: Abrir directamente en el navegador
Haz doble clic sobre el archivo `index.html` o ábrelo con cualquier navegador web moderno (Chrome, Edge, Firefox).
*(Nota: Al usar módulos ES6 `type="module"`, algunos navegadores pueden requerir servidor local por políticas CORS).*

### Opción 2: Usar un servidor local ligero
Con Node.js instalado, desde la carpeta `proyecto-js`:
```bash
# Con npx serve
npx serve .

# O con live-server
npx live-server
```

---

## ⚙️ Reglas de Negocio y Funcionalidades Integradas

1. **CU_PA_01 - Alta de Empleados (Crear empleado):**
   - **RN_87:** Folio generado automáticamente por el sistema.
   - Campos obligatorios con asterisco (`*`): Folio, Nombre, Teléfono, Área, Correo, Puesto, Clave de contrato.
   - Validación de rol del Gerente de RRHH (**RN_21, RN_25**), asignación de rol (**RN_29**) y credenciales únicas (**RN_30**).
   - Redirección automática a **Consulta de Empleados (CU_PA_04)** tras guardar.

2. **CU_PA_02 - Modificación de Empleados (Modificar empleado):**
   - Folio en modo protegido/solo lectura con asterisco obligatorio (`*`).
   - El resto de los campos sin asteriscos.
   - Validación de permisos de Gerente (**RN_27**), auditoría y aprobación de RRHH (**RN_24**).
   - Botón *Guardar cambios* direcciona a Consulta; botón *Regresar* direcciona a Crear empleado.

3. **CU_PA_03 - Baja de Empleados (Baja empleado):**
   - Modo de solo lectura con Folio con asterisco (`*`) y demás campos sin asterisco.
   - Botón único **Baja** que despliega modal de confirmación.
   - Revocación inmediata de credenciales (**RN_26**), bloqueo de acceso (**RN_22**) y activación de la retención histórica legal de 5 años (**RN_28**).

4. **CU_PA_04 - Consulta de Empleados (Consulta empleado):**
   - Vista completa de expediente en solo lectura (**RN_23**).
   - Verificación del estatus y de la vigencia de 5 años en caso de baja (**RN_28**).
   - Botón *Regresar* direccionando a Crear empleado.

5. **Widgets Flotantes Interactivos:**
   - **Verde (Reglas de Negocio):** Muestra las reglas específicas de la pantalla activa con contador y opción de minimizar.
   - **Azul (Dirección de Botones):** Lista todos los botones (incluyendo los de la barra superior con sus destinos "No sé" y "Al ABC de empleados").
