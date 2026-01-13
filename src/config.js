require('dotenv').config();

const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback',
  },
  server: {
    port: process.env.PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-this',
  },
  graph: {
    scopes: ['user.read', 'Calendars.Read', 'Chat.ReadWrite', 'offline_access'],
    apiUrl: 'https://graph.microsoft.com/v1.0',
  },
  reminders: {
    checkInterval: process.env.REMINDER_CHECK_INTERVAL || 60, // minutos
    advanceTime: process.env.REMINDER_ADVANCE_TIME || 30, // minutos antes del evento
  },
};

module.exports = config;
