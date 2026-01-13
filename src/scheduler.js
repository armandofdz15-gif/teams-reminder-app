const cron = require('node-cron');
const { getUpcomingEvents, getTodayEvents } = require('./calendar');
const { sendReminderEmail, sendDailySummary } = require('./reminders');
const config = require('./config');

// Almacenar usuarios autenticados
const authenticatedUsers = new Map();
const notifiedEvents = new Set();

function registerUser(userId, tokens, userEmail) {
  authenticatedUsers.set(userId, {
    tokens,
    userEmail,
    lastUpdate: new Date(),
  });
  console.log(`✓ Usuario registrado: ${userId}`);
}

function unregisterUser(userId) {
  authenticatedUsers.delete(userId);
  console.log(`✓ Usuario desregistrado: ${userId}`);
}

async function checkUpcomingEvents() {
  console.log('🔍 Verificando eventos próximos...');

  for (const [userId, userData] of authenticatedUsers.entries()) {
    try {
      const { tokens, userEmail } = userData;
      const upcomingEvents = await getUpcomingEvents(tokens, config.reminders.advanceTime);

      for (const event of upcomingEvents) {
        const eventKey = `${userId}-${event.id}`;

        if (!notifiedEvents.has(eventKey)) {
          const success = await sendReminderEmail(tokens, userEmail, event);
          if (success) {
            notifiedEvents.add(eventKey);
          }
        }
      }

      console.log(`✓ Procesados ${upcomingEvents.length} eventos para ${userId}`);
    } catch (error) {
      console.error(`Error procesando eventos para ${userId}:`, error);
    }
  }

  if (notifiedEvents.size > 1000) {
    notifiedEvents.clear();
  }
}

async function sendDailySummaries() {
  console.log('📧 Enviando resúmenes diarios...');

  for (const [userId, userData] of authenticatedUsers.entries()) {
    try {
      const { tokens, userEmail } = userData;
      const todayEvents = await getTodayEvents(tokens);
      await sendDailySummary(tokens, userEmail, todayEvents);
      console.log(`✓ Resumen enviado a ${userId}`);
    } catch (error) {
      console.error(`Error enviando resumen a ${userId}:`, error);
    }
  }
}

function startScheduler() {
  console.log('🚀 Iniciando scheduler...');

  const checkInterval = config.reminders.checkInterval || 60;
  const cronExpression = `*/${checkInterval} * * * *`;

  cron.schedule(cronExpression, () => {
    checkUpcomingEvents();
  });

  console.log(`✓ Verificación cada ${checkInterval} minutos`);

  cron.schedule('0 8 * * *', () => {
    sendDailySummaries();
  });

  console.log('✓ Resumen diario a las 8:00 AM');

  setTimeout(() => {
    checkUpcomingEvents();
  }, 5000);
}

function getRegisteredUsersCount() {
  return authenticatedUsers.size;
}

module.exports = {
  registerUser,
  unregisterUser,
  startScheduler,
  checkUpcomingEvents,
  getRegisteredUsersCount,
};
