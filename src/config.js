require('dotenv').config();

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

module.exports = config;
