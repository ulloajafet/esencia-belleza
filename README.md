# 🌸 Esencia Belleza — Sistema Web Completo

Salón de belleza y spa ubicado en Playas de Tijuana.  
Sistema con catálogo de servicios, carrito estilo Didi, agendado por WhatsApp y panel de citas.

---

## 📁 Estructura del Proyecto

```
esencia-belleza/
├── frontend/          → Sitio web estático (HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── backend/           → API Node.js + Express
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── render.yaml        → Config automática de Render
└── README.md
```

---

## 🚀 PASO A PASO: Subir a GitHub y Render

### PASO 1 — Crear cuenta en Neon (base de datos gratis)

1. Ve a **https://neon.tech** y crea una cuenta gratis
2. Crea un nuevo proyecto → llámalo `esencia-belleza`
3. Copia la **Connection String** que se ve así:
   ```
   postgresql://usuario:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Guárdala, la necesitas en el siguiente paso

---

### PASO 2 — Subir a GitHub

1. Ve a **https://github.com** → crea cuenta si no tienes
2. Clic en **"New repository"**
3. Nombre: `esencia-belleza`
4. Visibilidad: **Public** (para que Render lo detecte gratis)
5. Clic en **"Create repository"**

Ahora sube los archivos. Tienes 2 opciones:

**Opción A — Subir por la web (sin instalar nada):**
- En tu repositorio vacío, clic en **"uploading an existing file"**
- Arrastra TODOS los archivos y carpetas de este proyecto
- Clic en **"Commit changes"**

**Opción B — Con Git en tu PC:**
```bash
cd esencia-belleza
git init
git add .
git commit -m "🌸 Initial commit - Esencia Belleza"
git remote add origin https://github.com/TU_USUARIO/esencia-belleza.git
git push -u origin main
```

---

### PASO 3 — Crear cuenta en Render

1. Ve a **https://render.com** → crea cuenta gratis con GitHub
2. Clic en **"New +"** → **"Web Service"**

---

### PASO 4 — Desplegar el BACKEND (API)

1. En Render → **"New Web Service"**
2. Conecta tu repositorio de GitHub `esencia-belleza`
3. Configura:
   - **Name:** `esencia-belleza-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. En **"Environment Variables"** agrega:
   ```
   DATABASE_URL   = [tu connection string de Neon]
   FRONTEND_URL   = https://esencia-belleza.onrender.com
   ADMIN_KEY      = [inventa una clave larga, ej: EB_Admin_2024_Tijuana]
   ```
5. Clic en **"Create Web Service"**
6. Espera 2-3 minutos. Copia la URL que te da, ej: `https://esencia-belleza-api.onrender.com`

---

### PASO 5 — Actualizar URL del API en el frontend

Abre el archivo `frontend/js/config.js` y cambia la URL:
```javascript
window.APP_CONFIG = {
  apiUrl: 'https://esencia-belleza-api.onrender.com'  // ← tu URL real
};
```

Sube el cambio a GitHub (automáticamente Render actualizará).

---

### PASO 6 — Desplegar el FRONTEND

1. En Render → **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio
3. Configura:
   - **Name:** `esencia-belleza`
   - **Root Directory:** `frontend`
   - **Build Command:** (dejar vacío)
   - **Publish Directory:** `.`
4. Clic en **"Create Static Site"**
5. En 1-2 minutos tienes tu URL: `https://esencia-belleza.onrender.com`

---

## 📱 Cómo funciona el agendado

1. **Cliente** entra al sitio y elige servicios
2. Agrega al carrito (como Didi)
3. Indica si quiere todo el mismo día o días separados
4. Llena nombre y WhatsApp
5. Clic en "Enviar por WhatsApp" → se abre WhatsApp con el mensaje YA redactado
6. El cliente solo da clic en ENVIAR

**El mensaje que llega incluye:**
- Nombre del cliente
- Servicios seleccionados con precios
- Tipo de agenda (junto o separado)
- Fecha preferida
- Notas especiales

---

## 🔔 Recordatorios WhatsApp

El sistema guarda todas las citas en la base de datos.
Para enviar recordatorios del día siguiente:

1. Ve a: `https://esencia-belleza-api.onrender.com/api/recordatorios`
   (necesitas el header `x-admin-key: TU_CLAVE_ADMIN`)
2. Te devuelve las citas del día siguiente con estado "confirmada"
3. Por cada cita puedes abrir WhatsApp manualmente con el número guardado

**Próximamente:** automatización completa con n8n o Make (gratis).

---

## ⚙️ Variables de entorno (resumen)

| Variable | Dónde conseguirla | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Neon.tech dashboard | `postgresql://...` |
| `FRONTEND_URL` | URL de tu static site en Render | `https://esencia-belleza.onrender.com` |
| `ADMIN_KEY` | Tú la inventas | `EB_Sec_2024_TJ` |

---

## 📞 Soporte

¿Algo no funciona? Revisa:
1. En Render → tu servicio → pestaña **"Logs"**
2. Verifica que `DATABASE_URL` esté correcta
3. Verifica que la URL del API en `config.js` sea la correcta

---

Hecho con 🌸 para Esencia Belleza Salon · Playas de Tijuana
