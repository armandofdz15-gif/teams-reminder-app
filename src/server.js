const express = require('express');
const session = require('express-session');
const config = require('./config');
const auth = require('./auth');
const { getUserInfo, getTodayEvents } = require('./calendar');
const { registerUser, startScheduler, getRegisteredUsersCount } = require('./scheduler');

const app = express();

// Configurar sesiones
app.use(
  session({
    secret: config.server.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Cambiar a true en producción con HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  const isAuthenticated = req.session.isAuthenticated || false;

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorios de Microsoft Teams</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 32px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .features {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .feature {
          display: flex;
          align-items: center;
          margin: 10px 0;
          color: #555;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        .btn {
          background: #5865F2;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background 0.3s;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        .btn:hover {
          background: #4752C4;
        }
        .btn-secondary {
          background: #e74c3c;
          margin-top: 10px;
        }
        .btn-secondary:hover {
          background: #c0392b;
        }
        .status {
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #28a745;
        }
        .info {
          background: #d1ecf1;
          color: #0c5460;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #17a2b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔔 Recordatorios de Teams</h1>
        <p class="subtitle">Mantente al tanto de tus eventos importantes</p>

        ${
          isAuthenticated
            ? `
          <div class="status">
            ✅ Sesión activa. Los recordatorios están funcionando.
          </div>
          <a href="/dashboard" class="btn">Ver Eventos del Día</a>
          <a href="/logout" class="btn btn-secondary">Cerrar Sesión</a>
        `
            : `
          <div class="features">
            <div class="feature">
              <span class="feature-icon">📅</span>
              <span>Sincroniza tu calendario de Microsoft 365</span>
            </div>
            <div class="feature">
              <span class="feature-icon">⏰</span>
              <span>Recibe recordatorios 30 minutos antes</span>
            </div>
            <div class="feature">
              <span class="feature-icon">💬</span>
              <span>Notificaciones directas en Teams</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Resumen diario cada mañana</span>
            </div>
          </div>
          <a href="/auth/signin" class="btn">Iniciar Sesión con Microsoft</a>
        `
        }

        <div class="info">
          ℹ️ Usuarios activos: ${getRegisteredUsersCount()}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Ruta para iniciar sesión
app.get('/auth/signin', async (req, res) => {
  try {
    const authUrl = await auth.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error iniciando sesión:', error);
    res.status(500).send('Error al iniciar sesión');
  }
});

// Callback de autenticación
app.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send('Código de autorización no recibido');
    }

    // Obtener tokens
    const tokenResponse = await auth.getTokenFromCode(code);

    // Guardar en sesión
    req.session.accessToken = tokenResponse.accessToken;
    req.session.account = tokenResponse.account;
    req.session.isAuthenticated = true;

    // Obtener info del usuario
    const userInfo = await getUserInfo(tokenResponse.accessToken);
    req.session.userId = userInfo.userPrincipalName;

    // Registrar usuario para recordatorios
    registerUser(
      userInfo.userPrincipalName,
      tokenResponse.accessToken,
      tokenResponse.account
    );

    console.log(`✓ Usuario autenticado: ${userInfo.displayName}`);

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error en callback de autenticación:', error);
    res.status(500).send('Error completando autenticación');
  }
});

// Dashboard con eventos del día
app.get('/dashboard', async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect('/');
  }

  try {
    const userInfo = await getUserInfo(req.session.accessToken);
    const events = await getTodayEvents(req.session.accessToken);

    const eventsHtml = events.length
      ? events
          .map((event) => {
            const startTime = new Date(event.start.dateTime);
            const timeFormatted = startTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return `
            <div class="event">
              <div class="event-time">${timeFormatted}</div>
              <div class="event-details">
                <div class="event-title">${event.subject}</div>
                ${
                  event.location && event.location.displayName
                    ? `<div class="event-location">📍 ${event.location.displayName}</div>`
                    : ''
                }
                ${
                  event.attendees && event.attendees.length > 0
                    ? `<div class="event-attendees">👥 ${event.attendees.length} asistente(s)</div>`
                    : ''
                }
              </div>
            </div>
          `;
          })
          .join('')
      : '<p style="text-align: center; color: #999; padding: 40px;">No tienes eventos programados para hoy 🎉</p>';

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard - Eventos del Día</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header {
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          .user-info { color: #666; font-size: 14px; }
          .event {
            display: flex;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #5865F2;
          }
          .event-time {
            font-weight: 600;
            color: #5865F2;
            min-width: 80px;
            font-size: 18px;
          }
          .event-details { flex: 1; }
          .event-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 16px;
          }
          .event-location, .event-attendees {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .btn {
            background: #5865F2;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
          }
          .btn:hover { background: #4752C4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Eventos de Hoy</h1>
            <div class="user-info">👤 ${userInfo.displayName} (${userInfo.mail})</div>
          </div>

          <div class="events">
            ${eventsHtml}
          </div>

          <a href="/" class="btn">← Volver al Inicio</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    res.status(500).send('Error cargando eventos');
  }
});

// Cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error cerrando sesión:', err);
    }
    res.redirect('/');
  });
});

// Iniciar servidor
app.listen(config.server.port, () => {
  console.log(`\n🚀 Servidor iniciado en http://localhost:${config.server.port}`);
  console.log(`📝 Configuración:`);
  console.log(`   - Puerto: ${config.server.port}`);
  console.log(`   - Intervalo de verificación: ${config.reminders.checkInterval} minutos`);
  console.log(`   - Tiempo de anticipación: ${config.reminders.advanceTime} minutos\n`);

  // Iniciar scheduler de recordatorios
  startScheduler();
});

module.exports = app;
