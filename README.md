# 🔔 Recordatorios de Microsoft Teams

Aplicación Node.js que se conecta a Microsoft Teams mediante Microsoft Graph API para obtener eventos del calendario y enviar recordatorios automáticos.

## 🌟 Características

- ✅ **Autenticación OAuth 2.0** con Microsoft 365
- 📅 **Sincronización de calendario** - Obtiene eventos del día automáticamente
- ⏰ **Recordatorios inteligentes** - Notificaciones 30 minutos antes de cada evento
- 💬 **Notificaciones en Teams** - Mensajes directos con detalles del evento
- 📊 **Resumen diario** - Mensaje cada mañana con todos los eventos del día
- 🎨 **Interfaz web** - Dashboard para ver eventos y gestionar la sesión

## 📍 Requisitos Previos

- Node.js 14 o superior (solo para ejecución local)
- Cuenta de Microsoft con acceso a:
  - **Microsoft Teams** (para recibir recordatorios)
  - **Calendario de Outlook/Microsoft 365** (donde están tus eventos)
- Aplicación registrada en Azure AD (GRATIS - incluye instrucciones completas)

📖 **Guía paso a paso para conectar TU correo:** [`CONECTAR_TU_CORREO.md`](CONECTAR_TU_CORREO.md)

## 🚀 Dos Formas de Usar Esta App

### ⭐ Opción 1: Despliegue en la Nube (RECOMENDADO)

**Para que funcione 24/7 automáticamente sin depender de tu computadora:**

📖 **Lee la guía completa:** [`DESPLIEGUE_RAPIDO.md`](DESPLIEGUE_RAPIDO.md)

**Plataformas gratuitas disponibles:**
- 🚀 **Render** (100% gratis, recomendado) - Ver [`DEPLOY_RENDER.md`](DEPLOY_RENDER.md)
- 🚂 **Railway** ($5 gratis/mes) - Ver [`DEPLOY_RAILWAY.md`](DEPLOY_RAILWAY.md)

**Tiempo de configuración:** ~30 minutos  
**Costo:** $0 (totalmente gratis)

---

### 💻 Opción 2: Ejecutar Localmente

**Solo para pruebas o desarrollo (requiere tu computadora encendida):**

## 🚀 Configuración Local

### 1. Registrar aplicación en Azure AD

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Navega a **Azure Active Directory** > **App registrations** > **New registration**
3. Configura tu aplicación:
   - **Nombre**: Teams Reminder App
   - **Supported account types**: Accounts in any organizational directory
   - **Redirect URI**: Web - `http://localhost:3000/auth/callback`
4. Guarda el **Application (client) ID** y **Directory (tenant) ID**
5. Ve a **Certificates & secrets** > **New client secret** y guarda el valor
6. Ve a **API permissions** y agrega los siguientes permisos delegados de Microsoft Graph:
   - `User.Read`
   - `Calendars.Read`
   - `Chat.ReadWrite`
   - `offline_access`
7. Haz clic en **Grant admin consent**

### 2. Clonar e instalar dependencias

```bash
cd teams-reminder-app
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` basándote en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Configuración de Azure AD
CLIENT_ID=tu-application-id-de-azure
CLIENT_SECRET=tu-client-secret-de-azure
TENANT_ID=tu-tenant-id-de-azure
REDIRECT_URI=http://localhost:3000/auth/callback

# Configuración del servidor
PORT=3000
SESSION_SECRET=un-secret-aleatorio-muy-seguro

# Configuración de recordatorios (en minutos)
REMINDER_CHECK_INTERVAL=60
REMINDER_ADVANCE_TIME=30
```

## 🎯 Uso

### Iniciar la aplicación

```bash
npm start
```

O en modo desarrollo con reinicio automático:

```bash
npm run dev
```

### Acceder a la aplicación

1. Abre tu navegador en `http://localhost:3000`
2. Haz clic en **Iniciar Sesión con Microsoft**
3. Autoriza los permisos necesarios
4. ¡Listo! La aplicación comenzará a monitorear tu calendario

## 📁 Estructura del Proyecto

```
teams-reminder-app/
├── src/
│   ├── auth.js          # Gestión de autenticación OAuth 2.0
│   ├── calendar.js      # Funciones para obtener eventos del calendario
│   ├── config.js        # Configuración de la aplicación
│   ├── graphClient.js   # Cliente de Microsoft Graph API
│   ├── reminders.js     # Lógica para enviar recordatorios
│   ├── scheduler.js     # Programación de tareas periódicas
│   └── server.js        # Servidor Express principal
├── .env.example         # Plantilla de variables de entorno
├── package.json         # Dependencias del proyecto
└── README.md           # Este archivo
```

## 🔧 Configuración Avanzada

### Personalizar intervalos

En el archivo `.env` puedes ajustar:

- **REMINDER_CHECK_INTERVAL**: Frecuencia de verificación de eventos (en minutos)
- **REMINDER_ADVANCE_TIME**: Anticipación de recordatorios (en minutos antes del evento)

### Modificar horario de resumen diario

En `src/scheduler.js`, línea 143, puedes cambiar el horario:

```javascript
// Enviar resumen diario a las 8:00 AM
cron.schedule('0 8 * * *', () => {
  sendDailySummaries();
});
```

Formato cron: `minutos horas * * *`

## 🛠️ Desarrollo

### Scripts disponibles

- `npm start` - Inicia la aplicación en modo producción
- `npm run dev` - Inicia la aplicación con nodemon (reinicio automático)

### Módulos principales

- **auth.js**: Maneja la autenticación con MSAL (Microsoft Authentication Library)
- **calendar.js**: Interactúa con Microsoft Graph API para obtener eventos
- **reminders.js**: Formatea y envía mensajes de recordatorio a Teams
- **scheduler.js**: Gestiona tareas programadas con node-cron

## 🐛 Solución de Problemas

### Error de autenticación

- Verifica que CLIENT_ID, CLIENT_SECRET y TENANT_ID sean correctos
- Asegúrate de haber dado consentimiento de administrador a los permisos
- Comprueba que la URI de redirección coincida exactamente

### No se envían recordatorios

- Verifica que el usuario tenga chats en Teams
- Comprueba los logs del servidor para errores
- Asegúrate de que los permisos `Chat.ReadWrite` estén otorgados

### Eventos no se muestran

- Verifica el permiso `Calendars.Read`
- Asegúrate de que el calendario tenga eventos para el día
- Revisa la zona horaria en la configuración del calendario

## 📚 Recursos

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/overview)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [Microsoft Teams API](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview)

## 📝 Notas Importantes

- **Seguridad**: Nunca compartas tu archivo `.env` ni expongas tus credenciales
- **Producción**: Para uso en producción, implementa almacenamiento persistente de tokens (base de datos)
- **HTTPS**: En producción, usa HTTPS y configura `cookie.secure = true` en las sesiones
- **Escalabilidad**: Para múltiples usuarios, considera usar una base de datos para almacenar tokens

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto como desees.

## ✨ Próximas Mejoras

- [ ] Soporte para múltiples usuarios simultáneos con base de datos
- [ ] Notificaciones push mediante Webhooks de Teams
- [ ] Interfaz web más avanzada con React
- [ ] Recordatorios personalizables por evento
- [ ] Integración con otras plataformas (Slack, Discord)
- [ ] Análisis de productividad basado en calendario

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.
