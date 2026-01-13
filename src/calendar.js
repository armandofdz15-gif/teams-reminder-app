const { getAuthenticatedClient } = require('./graphClient');

/**
 * Obtiene los eventos del calendario para el día actual
 * @param {string} accessToken - Token de acceso del usuario
 * @returns {Array} Lista de eventos del día
 */
async function getTodayEvents(accessToken) {
  try {
    const client = getAuthenticatedClient(accessToken);

    // Obtener fecha de inicio y fin del día actual
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Consultar eventos del calendario
    const events = await client
      .api('/me/calendar/events')
      .filter(
        `start/dateTime ge '${startOfDay.toISOString()}' and end/dateTime le '${endOfDay.toISOString()}'`
      )
      .select('subject,start,end,location,attendees,isReminderOn,reminderMinutesBeforeStart')
      .orderby('start/dateTime')
      .get();

    return events.value || [];
  } catch (error) {
    console.error('Error obteniendo eventos del calendario:', error);
    throw error;
  }
}

/**
 * Obtiene eventos próximos en los siguientes X minutos
 * @param {string} accessToken - Token de acceso del usuario
 * @param {number} minutesAhead - Minutos de anticipación
 * @returns {Array} Lista de eventos próximos
 */
async function getUpcomingEvents(accessToken, minutesAhead = 30) {
  try {
    const client = getAuthenticatedClient(accessToken);

    const now = new Date();
    const futureTime = new Date(now.getTime() + minutesAhead * 60000);

    // Consultar eventos próximos
    const events = await client
      .api('/me/calendar/events')
      .filter(
        `start/dateTime ge '${now.toISOString()}' and start/dateTime le '${futureTime.toISOString()}'`
      )
      .select('subject,start,end,location,attendees,isReminderOn,reminderMinutesBeforeStart')
      .orderby('start/dateTime')
      .get();

    return events.value || [];
  } catch (error) {
    console.error('Error obteniendo eventos próximos:', error);
    throw error;
  }
}

/**
 * Obtiene información del usuario actual
 * @param {string} accessToken - Token de acceso del usuario
 * @returns {Object} Información del usuario
 */
async function getUserInfo(accessToken) {
  try {
    const client = getAuthenticatedClient(accessToken);

    const user = await client
      .api('/me')
      .select('displayName,mail,userPrincipalName')
      .get();

    return user;
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    throw error;
  }
}

module.exports = {
  getTodayEvents,
  getUpcomingEvents,
  getUserInfo,
};
