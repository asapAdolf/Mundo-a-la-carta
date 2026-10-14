# 🌐 Sistema de Gestión de Empleados - Mundo a la Carta

> **Arquitectura modular en JavaScript Vanilla (ES6 Modules)** basada en prototipos de interfaz de usuario y reglas de negocio para el módulo de Recursos Humanos (RRHH).

---

## 📋 Índice
1. [Descripción General](#-descripción-general)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
4. [Instalación y Ejecución](#-instalación-y-ejecución)
5. [Casos de Uso (Pantallas SPA)](#-casos-de-uso-pantallas-spa)
6. [Catálogo de Reglas de Negocio (RN)](#-catálogo-de-reglas-de-negocio-rn)
7. [Componentes y Widgets Especiales](#-componentes-y-widgets-especiales)
8. [Matriz de Direccionamiento de Botones](#-matriz-de-direccionamiento-de-botones)

---

## 📖 Descripción General

Este proyecto implementa el módulo de **Gestión de Empleados** para **Mundo a la Carta**, diseñado con un patrón de arquitectura limpia en JavaScript puro sin dependencias de compilación pesadas. Proporciona una experiencia de aplicación de una sola página (SPA) fluida, con validaciones estrictas de reglas de negocio, persistencia de estado en memoria y retroalimentación interactiva en tiempo real.

---

## 📁 Estructura del Proyecto

```text
pantallas/
├── index.html              # Punto de entrada HTML y contenedor SPA
├── package.json            # Metadatos del proyecto y scripts de ejecución
├── README.md               # Documentación integral del sistema
├── css/
│   └── styles.css          # Variables CSS, diseño corporativo, modales, toasts y animaciones
└── js/
    ├── app.js              # Controlador principal, despacho de eventos DOM y formularios
    ├── state.js            # Estado global reactivo, DB simulada y generador de folios
    ├── rules.js            # Catálogo centralizado de Reglas de Negocio y rutas de navegación
    ├── empleados.js        # Lógica de negocio y servicios CRUD (Altas, Modificar, Bajas, Consultas)
    └── ui.js               # Manipulador del DOM, cambio de vistas, modales y widgets flotantes
```

---

## 🛠 Tecnologías Utilizadas

- **JavaScript Vanilla (ES6 Modules):** Modularización nativa mediante `import`/`export` sin bundlers externos.
- **Tailwind CSS (CDN):** Framework de utilidades para estructura y maquetación ágil.
- **CSS3 Personalizado (`styles.css`):** Paleta corporativa (naranja cálido, esmeralda y azul), efectos de elevación (*box-shadows*), transiciones y micro-interacciones.
- **Font Awesome 6:** Iconografía vectorial interactiva.
- **Google Fonts (Inter):** Tipografía moderna y legible optimizada para interfaces administrativas.

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Tener instalado [Node.js](https://nodejs.org/) (versión 16 o superior recomendada).

### ⚡ Ejecución Rápida

Tienes 3 formas sencillas de arrancar el sistema:

#### Opción 1: Con el script Bash (`iniciar.sh`) — *Recomendado*
Si utilizas **Git Bash**, **WSL** o una terminal compatible con bash:
```bash
./iniciar.sh
```
*(Detecta automáticamente el entorno, inicia el servidor en el puerto `3000` y abre tu navegador).*

#### Opción 2: Con el script de Windows (`iniciar.bat`)
Haz doble clic sobre [iniciar.bat](file:///c:/Users/bofo2/Desktop/pantallas/iniciar.bat) o ejecútalo en CMD / PowerShell:
```powershell
.\iniciar.bat
```

#### Opción 3: Mediante comandos npm
```bash
npm run dev
# o bien:
npm start
```

*Ambos comandos ejecutan `node server.js` sin requerir descargas externas de npm.*

4. **¿Por qué se requiere un servidor local?**  
   Dado que el proyecto utiliza módulos nativos de JavaScript (`<script type="module" src="js/app.js">`), las políticas de seguridad CORS de los navegadores modernos restringen la carga de módulos mediante el protocolo `file://`. Un servidor local resuelve esta restricción automáticamente.

---

## 🖥 Casos de Uso (Pantallas SPA)

| Código | Pantalla | Descripción | Destino al Guardar / Regresar |
| :--- | :--- | :--- | :--- |
| **`CU_PA_01`** | **Crear Empleado** (Alta) | Registro de un nuevo empleado. Generación automática de folio secuencial. | **Guardar:** Consulta (`CU_PA_04`)<br>**Regresar:** Inicio |
| **`CU_PA_02`** | **Modificar Empleado** | Edición de expediente. Folio protegido en modo solo lectura. | **Guardar:** Consulta (`CU_PA_04`)<br>**Regresar:** Crear Empleado (`CU_PA_01`) |
| **`CU_PA_03`** | **Baja Empleado** | Desactivación definitiva con diálogo modal de confirmación y revocación de accesos. | **Baja:** Confirmación / Consulta<br>**Regresar:** Crear Empleado (`CU_PA_01`) |
| **`CU_PA_04`** | **Consulta Empleado** | Visualización detallada de los datos del empleado activo o en historial. | **Regresar:** Crear Empleado (`CU_PA_01`) |

---

## 📜 Catálogo de Reglas de Negocio (RN)

El sistema valida y refleja activamente las siguientes reglas institucionales:

- **RN_21:** Solo el *Gerente de Recursos Humanos* puede realizar altas y bajas de empleados.
- **RN_22:** Un empleado dado de baja no puede acceder al sistema.
- **RN_23:** La información de los empleados solo puede ser consultada por usuarios con el rol correspondiente.
- **RN_24:** Los cambios en los datos de los empleados deben ser aprobados por el departamento de Recursos Humanos.
- **RN_25:** La contratación de empleados debe cumplir con los requisitos internos (todos los campos obligatorios marcados con `*`).
- **RN_26:** La baja de un empleado revoca inmediatamente todos sus accesos al sistema.
- **RN_27:** Solo el *Gerente de Recursos Humanos* puede actualizar permisos de acceso de los empleados.
- **RN_28:** Los registros de empleados dados de baja deben mantenerse en el sistema durante al menos **5 años** (periodo de retención legal calculado automáticamente).
- **RN_29:** Cada empleado debe tener un rol definido en el sistema (*Gerente* o *Empleado*).
- **RN_30:** Los empleados no pueden compartir credenciales de acceso.
- **RN_87:** El **folio** del empleado es generado automáticamente por el sistema al registrar el alta (iniciando en `1004` y autoincremental).

---

## 🧩 Componentes y Widgets Especiales

### 1. Widget Verde Flotante: Reglas de Negocio
- Muestra dinámicamente las reglas aplicables a la pantalla actual.
- Incluye contador de reglas y botón para expandir/colapsar.

### 2. Widget Azul Flotante: Direccionamiento de Botones
- Documenta en vivo el comportamiento esperado y el destino de cada botón presente en pantalla y en la barra superior.
- Mapea botones estándar de navegación y acciones de formulario.

### 3. Selector de Empleado de Prueba
- Ubicado en la barra de navegación/estado, permite alternar entre empleados existentes (`1001: Carlos Ramírez`, `1002: Mariana Gómez`, `1003: Roberto Solís`) para validar de inmediato cómo se reflejan sus datos en las vistas de **Modificación**, **Baja** y **Consulta**.

### 4. Modal de Confirmación de Baja
- Evita bajas accidentales solicitando confirmación explícita con el nombre y folio del empleado seleccionado antes de aplicar la revocación de credenciales.

### 5. Notificaciones Toast Dinámicas
- Notificaciones no invasivas en la esquina superior derecha con retroalimentación visual inmediata (`éxito`, `error`, `información`).

---

## 🗺 Matriz de Direccionamiento de Botones

| Botón | Pantalla de Origen | Destino / Acción |
| :--- | :--- | :--- |
| **Guardar** | Crear (`CU_PA_01`) | Procesa el alta, guarda en estado y direcciona a **Consulta (`CU_PA_04`)** |
| **Regresar** | Crear (`CU_PA_01`) | Limpia el formulario y regresa a la pantalla de **Inicio** |
| **Guardar cambios** | Modificar (`CU_PA_02`) | Aplica modificaciones con aprobación de RRHH y direcciona a **Consulta (`CU_PA_04`)** |
| **Regresar** | Modificar (`CU_PA_02`) | Descarta cambios pendientes y regresa a **Crear Empleado (`CU_PA_01`)** |
| **Baja** | Baja (`CU_PA_03`) | Abre modal de confirmación; al confirmar revoca credenciales y direcciona a **Consulta** |
| **Regresar** | Baja (`CU_PA_03`) | Cancela la baja y regresa a **Crear Empleado (`CU_PA_01`)** |
| **Regresar** | Consulta (`CU_PA_04`) | Regresa a **Crear Empleado (`CU_PA_01`)** |
| **Empleados** | Barra Superior | Direcciona al módulo **ABC de empleados** (`CU_PA_01`) |
| **Inicio / Otros** | Barra Superior | Opciones en desarrollo (*"No sé"* según especificación del prototipo) |

---

## 👤 Autor y Licencia

- **Organización:** Mundo a la Carta
- **Licencia:** MIT
