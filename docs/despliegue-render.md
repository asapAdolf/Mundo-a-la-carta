# Guía de Despliegue en Render – Mundo a la Carta

Este proyecto está 100 % preparado para desplegarse como un **Web Service gratuito** en [Render](https://render.com).

El servidor utiliza **Node.js** con motor SQLite nativo (`node:sqlite`) y sirve tanto el frontend completo como la API REST conectada a la base de datos relacional.

---

## Opción 1: Despliegue con Blueprint Automático (`render.yaml`)

1. Sube tu proyecto a un repositorio en **GitHub** o **GitLab**.
2. Inicia sesión en [dashboard.render.com](https://dashboard.render.com/).
3. Haz clic en **New +** y selecciona **Blueprint**.
4. Conecta el repositorio de GitHub/GitLab.
5. Render detectará automáticamente el archivo [`render.yaml`](../render.yaml) y configurará:
   - **Nombre:** `mundo-a-la-carta`
   - **Runtime:** Node.js (v22+)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
6. Haz clic en **Apply** y espera 1 a 2 minutos mientras Render compila e inicia el servicio.

---

## Opción 2: Despliegue Manual como Web Service

Si prefieres crearlo manualmente sin Blueprints:

1. En el Dashboard de Render, haz clic en **New +** → **Web Service**.
2. Conecta tu repositorio de GitHub / GitLab.
3. Rellena los siguientes campos:
   - **Name:** `mundo-a-la-carta` (o el nombre que prefieras).
   - **Region:** Elige la más cercana (ej. `Oregon (US West)` o `Ohio (US East)`).
   - **Branch:** `main` (o tu rama principal).
   - **Runtime:** `Node`.
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`.
4. En **Advanced** (Opciones avanzadas):
   - **Health Check Path:** `/health`
   - En **Environment Variables** (Variables de entorno), agrega:
     - `NODE_VERSION` = `22.14.0`
5. Haz clic en **Create Web Service**.

---

## Verificación del Despliegue

Una vez completado el despliegue, Render te proporcionará una URL pública (por ejemplo: `https://mundo-a-la-carta.onrender.com`).

Prueba los siguientes enlaces:

| Enlace | Descripción |
|---|---|
| `https://tu-app.onrender.com/` | Inicio público / Catálogo. |
| `https://tu-app.onrender.com/api/health` | Estado del backend y base de datos (debe responder `{"status":"ok",...}`). |
| `https://tu-app.onrender.com/vistas/catalogo.html` | Catálogo de las 55 pantallas. |
| `https://tu-app.onrender.com/vistas/auth/acceso-personal.html` | Acceso al panel administrativo. |

### Cuentas de prueba para login:
- **Administrador:** `admin` / `admin123`
- **Gerente:** `gerente` / `gerente123`
- **Mesero:** `mesero` / `mesero123`
- **Ventas:** `ventas` / `ventas123`
- **Cliente:** `juan.perez@email.com` / `cliente123`

