# 🚀 Despliegue Rápido - Teams Reminder App

## 🎯 Objetivo

Alojar tu aplicación **24/7 en la nube GRATIS** para que funcione automáticamente sin depender de tu computadora.

## ⭐ Opción Recomendada: Render (100% Gratuito)

### ✅ Por qué Render es perfecto para tu caso:

- **🆓 Totalmente gratuito** - No necesitas tarjeta de crédito
- **⚡ 750 horas/mes** - Suficiente para funcionar 24/7
- **🔒 HTTPS automático** - SSL incluido
- **🔄 Despliegue desde GitHub** - Actualizaciones automáticas
- **📊 Logs en tiempo real** - Para monitorear

### 🚀 Pasos Súper Rápidos:

#### 1. **Subir a GitHub** (5 minutos)

```bash
# Desde la carpeta teams-reminder-app
git init
git add .
git commit -m "Teams Reminder App completa"

# Crear repo en GitHub y conectar:
# Ve a github.com → New repository → teams-reminder-app
git remote add origin https://github.com/TU_USUARIO/teams-reminder-app.git
git branch -M main
git push -u origin main
```

#### 2. **Registrar en Azure AD** (10 minutos)

Solo necesitas esto para obtener las credenciales (gratuito):

1. Ve a [portal.azure.com](https://portal.azure.com)
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Configura:
   - **Name**: Teams Reminder App
   - **Redirect URI**: `http://localhost:3000/auth/callback` (cambiaremos después)
4. Guarda: **Client ID**, **Tenant ID**
5. **Certificates & secrets** → **New client secret** → Guarda el **Value**
6. **API permissions** → **Add permission** → **Microsoft Graph** → **Delegated**:
   - `User.Read`
   - `Calendars.Read`
   - `Chat.ReadWrite`
   - `offline_access`
7. **Grant admin consent**

#### 3. **Desplegar en Render** (10 minutos)

1. Ve a [render.com](https://render.com) → **Get Started** → Conectar GitHub
2. **New +** → **Web Service** → Selecciona tu repo
3. Configuración:
   - **Name**: `teams-reminder-app`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

#### 4. **Variables de Entorno en Render**

En **Environment**, agregar:

```
CLIENT_ID = tu-client-id-de-azure
CLIENT_SECRET = tu-client-secret-de-azure  
TENANT_ID = tu-tenant-id-de-azure
REDIRECT_URI = https://teams-reminder-app-xxxx.onrender.com/auth/callback
SESSION_SECRET = un-secret-super-seguro-aleatorio
REMINDER_CHECK_INTERVAL = 60
REMINDER_ADVANCE_TIME = 30
```

#### 5. **Actualizar Azure AD**

1. Vuelve al Azure Portal → Tu app → **Authentication**
2. **Add platform** → **Web** → Agregar la URL de Render:
   ```
   https://teams-reminder-app-xxxx.onrender.com/auth/callback
   ```

#### 6. **Mantener App Activa** (5 minutos)

Para evitar que "se duerma":

1. Ve a [uptimerobot.com](https://uptimerobot.com) → Crear cuenta
2. **Add New Monitor**:
   - **Type**: HTTP(s)
   - **URL**: Tu URL de Render
   - **Interval**: 5 minutos
3. **Create Monitor**

## 🎉 ¡Listo!

Tu aplicación ahora está:

- ✅ **Funcionando 24/7** en la nube
- ✅ **Monitoreando tu calendario** automáticamente  
- ✅ **Enviando recordatorios** a Teams
- ✅ **Sin costo alguno**

**URL de tu app:** `https://teams-reminder-app-xxxx.onrender.com`

---

## 🆘 Si Tienes Problemas

### La app no inicia:
- Revisa los **logs** en Render Dashboard
- Verifica que todas las variables de entorno estén configuradas

### Error de autenticación:
- Asegúrate de que la `REDIRECT_URI` coincida exactamente en Azure AD y Render
- Debe empezar con `https://` (no `http://`)

### No llegan recordatorios:
- Verifica que tengas permisos `Chat.ReadWrite`
- Asegúrate de haber hecho "Grant admin consent"

---

## 📱 Cómo Usar

1. **Accede** a tu URL de Render
2. **Haz clic** en "Iniciar Sesión con Microsoft"
3. **Autoriza** los permisos
4. **¡Listo!** La app monitoreará tu calendario automáticamente

**Recordatorios:**
- 📅 **Resumen diario** a las 8:00 AM
- ⏰ **Recordatorios** 30 minutos antes de cada evento
- 💬 **Mensajes directos** en Teams con detalles del evento

---

**🔥 Tiempo total de configuración: ~30 minutos**

**💰 Costo: $0 (completamente gratis)**

**🚀 Resultado: App funcionando 24/7 automáticamente**