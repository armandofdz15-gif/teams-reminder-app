const cron = require('node-cron');
const { getUpcomingEvents, getTodayEvents } = require('./calendar');
const { sendReminderToUser, sendDailySummary } = require('./reminders');
const config = require('./config');

// Almacenar usuarios autenticados y sus tokens
const authenticatedUsers = new Map();

// Set para rastrear eventos ya notificados
const notifiedEvents = new Set();

/**
 * Registra un usuario autenticado para recibir recordatorios
 * @param {string} userId - ID del usuario
 * @param {string} accessToken - Token de acceso
 * @param {Object} account - Objeto de cuenta de MSAL
 */
function registerUser(userId, accessToken, account) {
  authenticatedUsers.set(userId, {
    accessToken,
    account,
    lastUpdate: new Date(),
  });
  console.log(`✓ Usuario registrado para recordatorios: ${userId}`);
}

/**
 * Desregistra un usuario
 * @param {string} userId - ID del usuario
 */
function unregisterUser(userId) {
  authenticatedUsers.delete(userId);
  console.log(`✓ Usuario desregistrado: ${userId}`);
}

/**
 * Actualiza el token de acceso de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} accessToken - Nuevo token de acceso
 */
function updateUserToken(userId, accessToken) {
  const user = authenticatedUsers.get(userId);
  if (user) {
    user.accessToken = accessToken;
    user.lastUpdate = new Date();
  }
}

/**
 * Verifica eventos próximos y envía recordatorios
 */
async function checkUpcomingEvents() {
  console.log('🔍 Verificando eventos próximos...');

  for (const [userId, userData] of authenticatedUsers.entries()) {
    try {
      const { accessToken } = userData;

      // Obtener eventos próximos
      const upcomingEvents = await getUpcomingEvents(
        accessToken,
        config.reminders.advanceTime
      );

      // Enviar recordatorios para eventos no notificados
      for (const event of upcomingEvents) {
        const eventKey = `${userId}-${event.id}`;

        if (!notifiedEvents.has(eventKey)) {
          const success = await sendReminderToUser(accessToken, userId, event);

          if (success) {
            notifiedEvents.add(eventKey);
            console.log(`✓ Recordatorio enviado: ${event.subject}`);
          }
        }
      }

      console.log(
        `✓ Procesados ${upcomingEvents.length} eventos para usuario ${userId}`
      );
    } catch (error) {
      console.error(`Error procesando eventos para usuario ${userId}:`, error);
    }
  }

  // Limpiar eventos notificados antiguos (más de 2 horas)
  cleanupNotifiedEvents();
}

/**
 * Envía resumen diario a todos los usuarios registrados
 */
async function sendDailySummaries() {
  console.log('📧 Enviando resúmenes diarios...');

  for (const [userId, userData] of authenticatedUsers.entries()) {
    try {
      const { accessToken } = userData;

      // Obtener eventos del día
      const todayEvents = await getTodayEvents(accessToken);

      // Enviar resumen
      await sendDailySummary(accessToken, userId, todayEvents);

      console.log(`✓ Resumen diario enviado a usuario ${userId}`);
    } catch (error) {
      console.error(`Error enviando resumen a usuario ${userId}:`, error);
    }
  }
}

/**
 * Limpia eventos notificados antiguos del set
 */
function cleanupNotifiedEvents() {
  // En una implementación real, podrías almacenar timestamp con cada evento
  // y limpiar los que tienen más de X horas
  if (notifiedEvents.size > 1000) {
    notifiedEvents.clear();
    console.log('🧹 Cache de eventos notificados limpiado');
  }
}

/**
 * Inicia el scheduler de recordatorios
 */
function startScheduler() {
  console.log('🚀 Iniciando scheduler de recordatorios...');

  // Verificar eventos próximos cada hora (o según configuración)
  const checkInterval = config.reminders.checkInterval || 60;
  const cronExpression = `*/${checkInterval} * * * *`;

  cron.schedule(cronExpression, () => {
    checkUpcomingEvents();
  });

  console.log(`✓ Scheduler configurado: verificación cada ${checkInterval} minutos`);

  // Enviar resumen diario a las 8:00 AM
  cron.schedule('0 8 * * *', () => {
    sendDailySummaries();
  });

  console.log('✓ Resumen diario configurado para las 8:00 AM');

  // Verificación inicial inmediata
  setTimeout(() => {
    checkUpcomingEvents();
  }, 5000);
}

/**
 * Obtiene el número de usuarios registrados
 */
function getRegisteredUsersCount() {
  return authenticatedUsers.size;
}

module.exports = {
  registerUser,
  unregisterUser,
  updateUserToken,
  startScheduler,
  checkUpcomingEvents,
  getRegisteredUsersCount,
};
