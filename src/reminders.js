const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

/**
 * Envía un email de recordatorio al usuario
 */
async function sendReminderEmail(tokens, userEmail, event) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    const startTime = new Date(event.start.dateTime || event.start.date);
    const endTime = new Date(event.end.dateTime || event.end.date);
    
    const startTimeFormatted = startTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const endTimeFormatted = endTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Construir mensaje
    let message = `🔔 Recordatorio de Evento\n\n`;
    message += `📌 ${event.summary}\n`;
    message += `🕒 Hora: ${startTimeFormatted} - ${endTimeFormatted}\n`;

    if (event.location) {
      message += `📍 Ubicación: ${event.location}\n`;
    }

    if (event.attendees && event.attendees.length > 0) {
      const attendeeNames = event.attendees
        .map((attendee) => attendee.email)
        .slice(0, 5)
        .join(', ');
      message += `👥 Asistentes: ${attendeeNames}`;
      if (event.attendees.length > 5) {
        message += ` y ${event.attendees.length - 5} más`;
      }
      message += '\n';
    }

    const minutesUntilEvent = Math.round((startTime - new Date()) / 60000);
    message += `\n⏰ El evento comienza en ${minutesUntilEvent} minutos.`;

    // Crear email en formato RFC 2822
    const emailContent = [
      `To: ${userEmail}`,
      `Subject: 🔔 Recordatorio: ${event.summary}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      message
    ].join('\n');

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✓ Recordatorio enviado por email: ${event.summary}`);
    return true;
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    return false;
  }
}

/**
 * Envía un email con resumen diario
 */
async function sendDailySummary(tokens, userEmail, events) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    let message = `📅 Resumen de Eventos del Día\n\n`;

    if (events.length === 0) {
      message += `No tienes eventos programados para hoy. ¡Disfruta tu día! 🎉`;
    } else {
      message += `Tienes ${events.length} evento(s) programado(s):\n\n`;

      events.forEach((event, index) => {
        const startTime = new Date(event.start.dateTime || event.start.date);
        const timeFormatted = startTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });

        message += `${index + 1}. ${event.summary} - ${timeFormatted}\n`;
      });
    }

    // Crear email
    const emailContent = [
      `To: ${userEmail}`,
      `Subject: 📅 Tu agenda del día`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      message
    ].join('\n');

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✓ Resumen diario enviado');
    return true;
  } catch (error) {
    console.error('Error enviando resumen diario:', error);
    return false;
  }
}

module.exports = {
  sendReminderEmail,
  sendDailySummary,
};
