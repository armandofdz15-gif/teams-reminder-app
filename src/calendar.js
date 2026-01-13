const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

/**
 * Obtiene los eventos del calendario para el día actual
 * @param {Object} tokens - Tokens de autenticación de Google
 * @returns {Array} Lista de eventos del día
 */
async function getTodayEvents(tokens) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    // Obtener fecha de inicio y fin del día actual
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error obteniendo eventos del calendario:', error);
    throw error;
  }
}

/**
 * Obtiene eventos próximos en los siguientes X minutos
 * @param {Object} tokens - Tokens de autenticación de Google
 * @param {number} minutesAhead - Minutos de anticipación
 * @returns {Array} Lista de eventos próximos
 */
async function getUpcomingEvents(tokens, minutesAhead = 30) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const futureTime = new Date(now.getTime() + minutesAhead * 60000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: futureTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error obteniendo eventos próximos:', error);
    throw error;
  }
}

/**
 * Obtiene información del usuario actual
 * @param {Object} tokens - Tokens de autenticación de Google
 * @returns {Object} Información del usuario
 */
async function getUserInfo(tokens) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth });

    const { data } = await oauth2.userinfo.get();

    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    throw error;
  }
}

/**
 * Crea un nuevo evento en el calendario
 * @param {Object} tokens - Tokens de autenticación de Google
 * @param {Object} eventDetails - Detalles del evento {title, date, time, duration}
 * @returns {Object} Evento creado
 */
async function createEvent(tokens, eventDetails) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    const { title, date, time, duration = 60 } = eventDetails;

    // Crear fecha y hora de inicio
    const startDateTime = new Date(`${date}T${time}`);
    
    // Calcular fecha y hora de fin (duración en minutos)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const event = {
      summary: title,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error creando evento:', error);
    throw error;
  }
}

module.exports = {
  getTodayEvents,
  getUpcomingEvents,
  getUserInfo,
  createEvent,
};
