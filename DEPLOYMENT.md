# Guía de Deployment en Render (100% Gratis)

## Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub
2. Haz commit de los cambios recientes:
```bash
git add .
git commit -m "Preparar para deployment en Render"
git push origin main
```

## Paso 2: Configurar Google Cloud Console

Antes de hacer deploy, actualiza la URI de redirección en Google Cloud:

1. Ve a https://console.cloud.google.com/apis/credentials
2. Edita tus credenciales OAuth 2.0
3. Agrega tu URL de Render a **URIs de redirección autorizados**:
   - Formato: `https://TU-APP-NAME.onrender.com/auth/callback`
   - Ejemplo: `https://teams-reminder-app.onrender.com/auth/callback`
4. Guarda los cambios

## Paso 3: Crear Cuenta en Render

1. Ve a https://render.com
2. Crea cuenta (puedes usar tu cuenta de GitHub)
3. Es 100% gratis, no requiere tarjeta de crédito

## Paso 4: Crear Web Service

1. Click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Render detectará automáticamente que es una app de Node.js

## Paso 5: Configurar el Servicio

**Configuración básica:**
- **Name**: `teams-reminder-app` (o el que prefieras)
- **Region**: Selecciona la más cercana
- **Branch**: `main`
- **Root Directory**: (déjalo vacío)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** ✅

## Paso 6: Variables de Entorno

En la sección **Environment Variables**, agrega:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Tu Client ID de Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Tu Client Secret de Google Cloud |
| `REDIRECT_URI` | `https://TU-APP.onrender.com/auth/callback` |
| `SESSION_SECRET` | Cualquier string aleatorio largo |
| `REMINDER_CHECK_INTERVAL` | `60` |
| `REMINDER_ADVANCE_TIME` | `30` |
| `NODE_ENV` | `production` |

**Para generar SESSION_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Paso 7: Deploy

1. Click en **"Create Web Service"**
2. Render comenzará a hacer el deploy automáticamente
3. Espera 2-5 minutos

## Paso 8: Verificar

1. Una vez completado, Render te dará una URL como:
   `https://teams-reminder-app.onrender.com`
2. Abre la URL en tu navegador
3. Inicia sesión con Google
4. ¡Listo! Tu app está corriendo 24/7

## Limitaciones del Plan Gratuito

✅ **Incluye:**
- 750 horas/mes (suficiente para 24/7)
- SSL gratis
- Deploy automático desde GitHub
- Variables de entorno
- Logs

⚠️ **Consideraciones:**
- El servicio se "duerme" después de 15 min de inactividad
- Tarda ~30 segundos en "despertar" al recibir una request
- Si no es crítico que responda instantáneamente, es perfecto

## Mantener el Servicio Activo (Opcional)

Si necesitas que no se duerma, puedes usar un **cron job gratuito** para hacer ping cada 10 minutos:

1. Crea cuenta en https://cron-job.org (gratis)
2. Crea un cron job que haga GET a tu URL cada 10 min
3. URL: `https://TU-APP.onrender.com/`

## Auto-Deploy

Render hace deploy automático cada vez que haces push a `main`. No necesitas hacer nada más.

## Ver Logs

En el dashboard de Render:
1. Selecciona tu servicio
2. Ve a la pestaña **"Logs"**
3. Verás todos los console.log en tiempo real

## Troubleshooting

**Error de autenticación:**
- Verifica que la `REDIRECT_URI` en Render coincida con la configurada en Google Cloud

**App no inicia:**
- Revisa los logs en Render
- Verifica que todas las variables de entorno estén configuradas

**Session no persiste:**
- Render puede reiniciar el servicio. Para producción real, considera usar Redis para sesiones (hay opciones gratuitas)

## Próximos Pasos (Opcional)

Para mejorar en el futuro:
- [ ] Agregar base de datos (MongoDB Atlas gratis)
- [ ] Persistir sesiones con Redis (Upstash gratis)
- [ ] Configurar dominio personalizado
- [ ] Agregar monitoring (Render lo incluye)
