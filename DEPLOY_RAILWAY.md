# 🚂 Guía de Despliegue en Railway

Railway es otra excelente opción para alojar tu aplicación Node.js con créditos gratuitos iniciales.

## ✅ Ventajas de Railway

- 💰 **$5 de crédito gratuito/mes** (suficiente para apps pequeñas)
- 🚀 **Despliegue ultra rápido** desde GitHub
- 🌐 **Dominio personalizado gratuito**
- 📊 **Dashboard intuitivo**
- 🔧 **Variables de entorno fáciles de configurar**

## 📋 Pasos para Desplegar

### 1. Subir a GitHub

Si aún no lo has hecho:

```bash
git init
git add .
git commit -m "Initial commit - Teams Reminder App"
git remote add origin https://github.com/TU_USUARIO/teams-reminder-app.git
git branch -M main
git push -u origin main
```

### 2. Registrarse en Railway

1. Ve a [https://railway.app](https://railway.app)
2. Haz clic en **"Login"**
3. Conéctate con tu cuenta de GitHub
4. Autoriza el acceso

### 3. Crear Nuevo Proyecto

1. En el Dashboard, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Elige el repositorio `teams-reminder-app`
4. Railway detectará automáticamente que es una app Node.js

### 4. Configurar Variables de Entorno

1. En tu proyecto, haz clic en el servicio
2. Ve a la pestaña **"Variables"**
3. Agrega las siguientes variables:

```
CLIENT_ID = tu-client-id-de-azure
CLIENT_SECRET = tu-client-secret-de-azure
TENANT_ID = tu-tenant-id-de-azure
REDIRECT_URI = https://tu-dominio.up.railway.app/auth/callback
SESSION_SECRET = genera-un-secret-muy-seguro
REMINDER_CHECK_INTERVAL = 60
REMINDER_ADVANCE_TIME = 30
```

**Nota:** Railway te asignará automáticamente un dominio. Lo verás en la pestaña **"Settings"** → **"Domains"**

### 5. Actualizar Azure AD

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Navega a tu aplicación registrada
3. Agrega la URI de Railway en **"Authentication"**:
   ```
   https://tu-dominio.up.railway.app/auth/callback
   ```

### 6. Desplegar

Railway desplegará automáticamente tu aplicación. 

1. Ve a la pestaña **"Deployments"** para ver el progreso
2. Una vez completado, tu app estará en: `https://tu-dominio.up.railway.app`

## 💰 Gestión de Créditos

Railway te da **$5 de crédito gratuito/mes**:

- Una app pequeña Node.js consume aproximadamente **$3-4/mes**
- Monitorea tu uso en el Dashboard
- Si necesitas más, considera:
  - Optimizar el código para usar menos recursos
  - Agregar una tarjeta (obtienes $5 adicionales)

## 🔄 Actualizaciones Automáticas

Cada push a GitHub desplegará automáticamente:

```bash
git add .
git commit -m "Actualización"
git push origin main
```

## 📊 Monitorear

- **Logs:** Ve a la pestaña "Deployments" → Ver logs del último deploy
- **Métricas:** Railway muestra uso de CPU, memoria y ancho de banda

## 🎉 ¡Listo!

Tu aplicación está en la nube y funcionando 24/7.

**URL:** `https://tu-dominio.up.railway.app`

---

**Documentación:** [https://docs.railway.app](https://docs.railway.app)
