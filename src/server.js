const express = require('express');
const session = require('express-session');
const config = require('./config');
const { getAuthUrl, getTokenFromCode } = require('./googleAuth');
const { getUserInfo, getTodayEvents } = require('./calendar');
const { registerUser, startScheduler, getRegisteredUsersCount } = require('./scheduler');
const { processMessage } = require('./chatProcessor');

const app = express();

app.use(session({
  secret: config.server.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal  
app.get('/', (req, res) => {
  const isAuthenticated = req.session.isAuthenticated || false;

  // Si está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return res.redirect('/dashboard');
  }

  // Página de login
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorios de Google Calendar</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        h1 { color: #333; margin-bottom: 10px; font-size: 32px; }
        .subtitle { color: #666; margin-bottom: 30px; font-size: 16px; }
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
        .feature-icon { font-size: 24px; margin-right: 12px; }
        .btn {
          background: #4285f4;
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
          margin-top: 10px;
        }
        .btn:hover { background: #357ae8; }
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
        <h1>💬 Asistente de Recordatorios</h1>
        <p class="subtitle">Crea recordatorios con lenguaje natural</p>

        <div class="features">
          <div class="feature">
            <span class="feature-icon">💬</span>
            <span>Escribe en lenguaje natural</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🤖</span>
            <span>El sistema entiende tu mensaje</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📅</span>
            <span>Crea eventos automáticamente</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📧</span>
            <span>Recibe recordatorios por email</span>
          </div>
        </div>
        <a href="/auth/signin" class="btn">Iniciar Sesión con Google</a>

        <div class="info">
          ℹ️ Usuarios activos: ${getRegisteredUsersCount()}
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Dashboard - new unified interface
app.get('/dashboard', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect('/');
  }

  res.sendFile(__dirname + '/dashboard.html');
});

// API endpoint to get user info
app.get('/api/user', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  res.json({
    name: req.session.userName,
    email: req.session.userEmail
  });
});

// API endpoint to get today's events
app.get('/api/events/today', async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const events = await getTodayEvents(req.session.tokens);
    res.json(events);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error obteniendo eventos' });
  }
});

// API endpoint para procesar mensajes del chat
app.post('/api/chat', async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ success: false, error: 'No autenticado' });
  }

  try {
    const { message } = req.body;
    const result = await processMessage(req.session.tokens, message);
    res.json(result);
  } catch (error) {
    console.error('Error en chat:', error);
    res.json({ success: false, error: 'Error procesando mensaje' });
  }
});

// Iniciar sesión
app.get('/auth/signin', async (req, res) => {
  try {
    const authUrl = getAuthUrl();
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
    if (!code) return res.status(400).send('Código no recibido');

    const tokens = await getTokenFromCode(code);
    const userInfo = await getUserInfo(tokens);

    req.session.tokens = tokens;
    req.session.userEmail = userInfo.email;
    req.session.userName = userInfo.name;
    req.session.isAuthenticated = true;

    registerUser(userInfo.email, tokens, userInfo.email);
    console.log(`✓ Usuario autenticado: ${userInfo.name}`);

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error en callback:', error);
    res.status(500).send('Error completando autenticación');
  }
});


// Cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Error cerrando sesión:', err);
    res.redirect('/');
  });
});

// Iniciar servidor
app.listen(config.server.port, () => {
  console.log(`\n🚀 Servidor iniciado en http://localhost:${config.server.port}`);
  console.log(`💬 Dashboard disponible en: http://localhost:${config.server.port}/dashboard`);
  console.log(`📝 Configuración:`);
  console.log(`   - Puerto: ${config.server.port}`);
  console.log(`   - Intervalo: ${config.reminders.checkInterval} min`);
  console.log(`   - Anticipación: ${config.reminders.advanceTime} min\n`);

  startScheduler();
});

module.exports = app;
