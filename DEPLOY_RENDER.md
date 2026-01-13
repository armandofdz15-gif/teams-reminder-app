# 🚀 Guía de Despliegue en Render (GRATUITO)

Render es una plataforma PaaS gratuita perfecta para alojar tu aplicación Node.js 24/7.

## ✅ Ventajas de Render

- ✨ **Totalmente gratuito** para proyectos pequeños
- 🔄 **Despliegue automático** desde GitHub
- 🌐 **HTTPS gratuito** con certificado SSL
- 📊 **Logs en tiempo real**
- ⏰ **Aplicación siempre activa** (puede tener inactividad de 15 min después de 15 min sin uso)

## 📋 Pasos para Desplegar

### 1. Preparar el Código

Ya está todo listo, pero necesitas hacer un pequeño ajuste:

**Agregar `render.yaml` (opcional pero recomendado):**

```yaml
services:
  - type: web
    name: teams-reminder-app
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### 2. Subir a GitHub

```bash
# Inicializar repositorio git
git init

# Agregar archivos
git add .

# Hacer commit
git commit -m "Initial commit - Teams Reminder App"

# Crear repositorio en GitHub y conectarlo
# Ve a github.com y crea un nuevo repositorio
# Luego ejecuta:
git remote add origin https://github.com/TU_USUARIO/teams-reminder-app.git
git branch -M main
git push -u origin main
```

### 3. Registrarse en Render

1. Ve a [https://render.com](https://render.com)
2. Haz clic en **"Get Started"**
3. Conéctate con tu cuenta de GitHub
4. Autoriza el acceso a tus repositorios

### 4. Crear Web Service

1. En el Dashboard de Render, haz clic en **"New +"** → **"Web Service"**
2. Selecciona el repositorio `teams-reminder-app`
3. Configura el servicio:
   - **Name**: `teams-reminder-app`
   - **Region**: Elige el más cercano (US West, Europe, etc.)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Selecciona **"Free"** ($0/mes)

### 5. Configurar Variables de Entorno

En la sección "Environment" de tu servicio, agrega:

```
CLIENT_ID = tu-client-id-de-azure
CLIENT_SECRET = tu-client-secret-de-azure
TENANT_ID = tu-tenant-id-de-azure
REDIRECT_URI = https://tu-app.onrender.com/auth/callback
PORT = 10000
SESSION_SECRET = genera-un-secret-muy-seguro-aqui
REMINDER_CHECK_INTERVAL = 60
REMINDER_ADVANCE_TIME = 30
```

**⚠️ IMPORTANTE:** 
- Cambia `tu-app` por el nombre real de tu servicio en Render
- El puerto en Render debe ser `10000` o usar `process.env.PORT`
- Actualiza la REDIRECT_URI en Azure AD también

### 6. Actualizar Azure AD

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Navega a tu aplicación registrada
3. Ve a **"Authentication"** → **"Platform configurations"** → **"Web"**
4. Agrega la nueva URI de redirección:
   ```
   https://tu-app.onrender.com/auth/callback
   ```
5. Guarda los cambios

### 7. Desplegar

1. Haz clic en **"Create Web Service"**
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará dependencias
   - Iniciará la aplicación
3. Espera unos minutos (2-5 min aproximadamente)
4. Tu app estará disponible en: `https://tu-app.onrender.com`

## 🔧 Mantener la App Activa

**Problema:** La versión gratuita de Render "duerme" después de 15 minutos de inactividad.

**Solución:** Usa un servicio de ping gratuito:

### Opción 1: UptimeRobot (Recomendado)

1. Ve a [https://uptimerobot.com](https://uptimerobot.com)
2. Crea una cuenta gratuita
3. Agrega un nuevo monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Teams Reminder App
   - **URL**: `https://tu-app.onrender.com`
   - **Monitoring Interval**: 5 minutos
4. Guarda

Esto hará ping cada 5 minutos y mantendrá tu app activa.

### Opción 2: Cron-Job.org

1. Ve a [https://cron-job.org](https://cron-job.org)
2. Regístrate gratis
3. Crea un nuevo Cron Job:
   - **URL**: `https://tu-app.onrender.com`
   - **Interval**: Cada 5 minutos
4. Activa el job

## 📊 Monitorear tu Aplicación

### Ver Logs en Tiempo Real

1. En tu Dashboard de Render
2. Selecciona tu servicio
3. Ve a la pestaña **"Logs"**
4. Verás todos los logs en tiempo real

### Verificar Estado

Accede a: `https://tu-app.onrender.com`

Deberías ver la página principal de la aplicación.

## 🔄 Actualizar la Aplicación

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Render detectará automáticamente los cambios y redesplegarará tu aplicación.

## ⚠️ Limitaciones de la Versión Gratuita

- ✅ **750 horas/mes** de tiempo de ejecución (suficiente para 24/7)
- ⚠️ **Se "duerme" después de 15 min** sin actividad (usa UptimeRobot)
- ✅ **100 GB de ancho de banda/mes**
- ✅ **SSL/HTTPS incluido**
- ✅ **Despliegues ilimitados**

## 🆘 Solución de Problemas

### La app no inicia

1. Verifica los logs en Render
2. Asegúrate de que `PORT` esté configurado correctamente:
   ```javascript
   const port = process.env.PORT || 3000;
   ```

### Error de autenticación

1. Verifica que `REDIRECT_URI` coincida exactamente en:
   - Variables de entorno en Render
   - Configuración de Azure AD
2. Asegúrate de que empiece con `https://` (no `http://`)

### La app se "duerme"

- Configura UptimeRobot como se describió arriba

## 🎉 ¡Listo!

Tu aplicación ahora está viviendo en la nube 24/7 y funcionará automáticamente para enviar recordatorios de Teams.

**URL de tu app:** `https://tu-app.onrender.com`

---

**¿Necesitas ayuda?** Consulta la [documentación oficial de Render](https://render.com/docs)
