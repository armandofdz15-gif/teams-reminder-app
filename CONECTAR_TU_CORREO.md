# 📧 Conectar Tu Correo Personal a la Aplicación

## 🎯 Objetivo

Conectar tu cuenta personal de Microsoft (Outlook, Hotmail, Office 365) para que la aplicación pueda leer tu calendario y enviarte recordatorios.

---

## ✅ Requisitos

- Cuenta de Microsoft con acceso a:
  - **Microsoft Teams** (para recibir recordatorios)
  - **Calendario de Outlook/Microsoft 365** (donde están tus eventos)

---

## 🔐 Paso 1: Registrar la Aplicación en Azure AD (Gratis)

**No te preocupes,** esto es completamente gratuito y solo necesitas hacerlo una vez.

### 1.1 Acceder al Portal de Azure

1. Ve a [https://portal.azure.com](https://portal.azure.com)
2. Inicia sesión con **tu cuenta de Microsoft personal** (la misma que usas para Teams)
3. Si es tu primera vez, acepta los términos

### 1.2 Crear el Registro de Aplicación

1. En la barra de búsqueda superior, escribe: **"Azure Active Directory"** o **"Microsoft Entra ID"**
2. Haz clic en el resultado
3. En el menú izquierdo, busca **"App registrations"** (Registros de aplicaciones)
4. Haz clic en **"+ New registration"** (Nuevo registro)

### 1.3 Configurar el Registro

Completa el formulario:

**Name (Nombre):**
```
Teams Reminder App
```

**Supported account types (Tipos de cuenta compatibles):**
- Selecciona: **"Accounts in any organizational directory and personal Microsoft accounts"**
- (Esto permite usar tu correo personal)

**Redirect URI (URI de redirección):**
- **Tipo:** Web
- **URI:** Por ahora usa `http://localhost:3000/auth/callback`
- (Lo cambiaremos después cuando despliegues)

Haz clic en **"Register"** (Registrar)

### 1.4 Guardar Credenciales

Después del registro, verás la página "Overview" de tu app. **Guarda estos valores:**

📝 **Application (client) ID:**
```
Ejemplo: 12345678-1234-1234-1234-123456789abc
```

📝 **Directory (tenant) ID:**
```
Ejemplo: 87654321-4321-4321-4321-cba987654321
```

---

## 🔑 Paso 2: Crear Client Secret

### 2.1 Generar el Secret

1. En el menú izquierdo, busca **"Certificates & secrets"**
2. Ve a la pestaña **"Client secrets"**
3. Haz clic en **"+ New client secret"**
4. Configura:
   - **Description:** `Teams Reminder App Secret`
   - **Expires:** 24 months (o el que prefieras)
5. Haz clic en **"Add"**

### 2.2 Guardar el Secret

⚠️ **MUY IMPORTANTE:** Copia el **VALUE** (no el Secret ID) **AHORA**. Solo se muestra una vez.

📝 **Client Secret Value:**
```
Ejemplo: abc123def456~xyz789.abcdefghijklmnop
```

---

## 🔓 Paso 3: Configurar Permisos

### 3.1 Agregar Permisos de API

1. En el menú izquierdo, busca **"API permissions"**
2. Haz clic en **"+ Add a permission"**
3. Selecciona **"Microsoft Graph"**
4. Selecciona **"Delegated permissions"**

### 3.2 Agregar Estos Permisos Uno por Uno:

Busca y marca cada uno:

✅ **User.Read** - Para leer tu información básica  
✅ **Calendars.Read** - Para leer eventos de tu calendario  
✅ **Chat.ReadWrite** - Para enviarte mensajes en Teams  
✅ **offline_access** - Para mantener la sesión activa

### 3.3 Otorgar Consentimiento

**Importante:** Después de agregar todos los permisos:

1. Haz clic en **"Grant admin consent for [Tu Nombre]"**
2. Confirma haciendo clic en **"Yes"**
3. Verás marcas verdes ✅ junto a cada permiso

---

## 🌐 Paso 4: Configurar la URI de Redirección

### Si vas a desplegar en Render (Recomendado):

1. Ve a **"Authentication"** en el menú izquierdo
2. En **"Platform configurations"**, verás tu URI de `localhost`
3. Haz clic en **"+ Add URI"**
4. Agrega: `https://tu-app.onrender.com/auth/callback`
   - (Reemplaza `tu-app` con el nombre real de tu servicio en Render)
5. Haz clic en **"Save"**

### Si vas a ejecutar localmente:

Ya tienes `http://localhost:3000/auth/callback` configurado, no necesitas cambiar nada.

---

## 📝 Paso 5: Usar las Credenciales

### Para Despliegue en Render:

En Render, configura estas variables de entorno:

```
CLIENT_ID = [El Application ID que guardaste]
CLIENT_SECRET = [El Client Secret Value que guardaste]
TENANT_ID = [El Directory ID que guardaste]
REDIRECT_URI = https://tu-app.onrender.com/auth/callback
SESSION_SECRET = [Genera algo aleatorio y seguro]
```

### Para Ejecución Local:

Crea un archivo `.env` en la raíz del proyecto:

```bash
CLIENT_ID=tu-application-id-aqui
CLIENT_SECRET=tu-client-secret-aqui
TENANT_ID=tu-tenant-id-aqui
REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=mi-secret-super-seguro-123
```

---

## 🎉 Paso 6: Probar la Conexión

### 6.1 Iniciar la Aplicación

**Si está en Render:**
- Accede a: `https://tu-app.onrender.com`

**Si es local:**
```bash
npm install
npm start
```
- Accede a: `http://localhost:3000`

### 6.2 Autenticarte

1. Haz clic en **"Iniciar Sesión con Microsoft"**
2. Ingresa tu correo (el mismo que usas para Teams)
3. Ingresa tu contraseña
4. **Acepta los permisos** que te solicita la aplicación
5. Serás redirigido al Dashboard

### 6.3 Verificar

En el Dashboard deberías ver:
- ✅ Tu nombre y correo
- ✅ Tus eventos del día (si tienes alguno)

---

## ✨ ¡Listo!

La aplicación ahora está conectada a tu correo y:

- 📅 Leerá tu calendario automáticamente
- ⏰ Te enviará recordatorios 30 minutos antes de cada evento
- 📊 Te enviará un resumen cada mañana a las 8:00 AM
- 💬 Todos los mensajes llegarán a **tu Teams personal**

---

## 🆘 Problemas Comunes

### "Error: invalid_client"
- Verifica que el `CLIENT_ID` y `CLIENT_SECRET` sean correctos
- Asegúrate de copiar el **VALUE** del secret, no el Secret ID

### "Redirect URI mismatch"
- La URI en Azure AD debe coincidir **exactamente** con la que usas
- Verifica `http://` vs `https://`
- No debe tener `/` al final

### "Need admin approval"
- Verifica que hayas hecho clic en "Grant admin consent"
- Si no ves el botón, es porque tu cuenta no tiene permisos de admin
- Intenta con una cuenta personal (Hotmail/Outlook.com)

### No llegan los recordatorios
- Verifica que tengas Teams instalado y activo
- Asegúrate de que el permiso `Chat.ReadWrite` esté otorgado
- Revisa los logs de la aplicación

---

## 🔒 Seguridad

**Tus credenciales están seguras:**

- ✅ Solo tú tienes acceso a tu Client Secret
- ✅ La aplicación nunca guarda tu contraseña
- ✅ Solo accede a lo que explícitamente autorizas
- ✅ Puedes revocar el acceso en cualquier momento desde tu cuenta de Microsoft

**Para revocar acceso:**
1. Ve a [https://account.microsoft.com/privacy/app-access](https://account.microsoft.com/privacy/app-access)
2. Busca "Teams Reminder App"
3. Haz clic en "Remove"

---

**¿Necesitas ayuda?** Abre un issue en GitHub o consulta las guías de despliegue.
