require('dotenv').config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Error: Faltan las siguientes variables de entorno:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPor favor, configúralas en Render o en tu archivo .env');
  process.exit(1);
}

const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  },
  server: {
    port: process.env.PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-this',
  },
  reminders: {
    checkInterval: process.env.REMINDER_CHECK_INTERVAL || 60, // minutos
    advanceTime: process.env.REMINDER_ADVANCE_TIME || 30, // minutos antes del evento
  },
};

// Log de configuración (sin mostrar secretos)
console.log('✓ Configuración cargada:');
console.log(`  - Client ID: ${config.google.clientId?.substring(0, 20)}...`);
console.log(`  - Redirect URI: ${config.google.redirectUri}`);
console.log(`  - Puerto: ${config.server.port}`);

module.exports = config;
