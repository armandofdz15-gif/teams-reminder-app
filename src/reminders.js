const { getAuthenticatedClient } = require('./graphClient');

/**
 * Envía un mensaje de recordatorio al usuario mediante Teams
 * @param {string} accessToken - Token de acceso del usuario
 * @param {string} userId - ID del usuario destinatario
 * @param {Object} event - Evento para el cual se envía el recordatorio
 */
async function sendReminderToUser(accessToken, userId, event) {
  try {
    const client = getAuthenticatedClient(accessToken);

    // Formatear la información del evento
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    
    const startTimeFormatted = startTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const endTimeFormatted = endTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Construir mensaje de recordatorio
    let message = `🔔 **Recordatorio de Evento**\n\n`;
    message += `📌 **${event.subject}**\n`;
    message += `🕒 **Hora:** ${startTimeFormatted} - ${endTimeFormatted}\n`;

    if (event.location && event.location.displayName) {
      message += `📍 **Ubicación:** ${event.location.displayName}\n`;
    }

    if (event.attendees && event.attendees.length > 0) {
      const attendeeNames = event.attendees
        .map((attendee) => attendee.emailAddress.name || attendee.emailAddress.address)
        .slice(0, 5)
        .join(', ');
      message += `👥 **Asistentes:** ${attendeeNames}`;
      if (event.attendees.length > 5) {
        message += ` y ${event.attendees.length - 5} más`;
      }
      message += '\n';
    }

    const minutesUntilEvent = Math.round((startTime - new Date()) / 60000);
    message += `\n⏰ El evento comienza en ${minutesUntilEvent} minutos.`;

    // Crear chat con el usuario (si no existe) y enviar mensaje
    const chatMessage = {
      body: {
        contentType: 'text',
        content: message,
      },
    };

    // Primero obtener o crear un chat con el usuario
    const chats = await client.api('/me/chats').get();

    // Buscar chat existente con el usuario
    let chatId = null;
    for (const chat of chats.value) {
      if (chat.chatType === 'oneOnOne') {
        chatId = chat.id;
        break;
      }
    }

    // Si no hay chat, intentar enviar a través de la API de mensajes directos
    // Nota: En producción, podrías usar webhooks o notificaciones de Teams
    if (chatId) {
      await client.api(`/chats/${chatId}/messages`).post(chatMessage);
      console.log(`✓ Recordatorio enviado para: ${event.subject}`);
    } else {
      console.log(`⚠ No se pudo enviar recordatorio (sin chat): ${event.subject}`);
      // Alternativamente, podrías enviar un email como fallback
    }

    return true;
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    // No lanzar error para que otros recordatorios se sigan procesando
    return false;
  }
}

/**
 * Envía un mensaje de resumen diario con todos los eventos
 * @param {string} accessToken - Token de acceso del usuario
 * @param {string} userId - ID del usuario destinatario
 * @param {Array} events - Lista de eventos del día
 */
async function sendDailySummary(accessToken, userId, events) {
  try {
    const client = getAuthenticatedClient(accessToken);

    let message = `📅 **Resumen de Eventos del Día**\n\n`;

    if (events.length === 0) {
      message += `No tienes eventos programados para hoy. ¡Disfruta tu día! 🎉`;
    } else {
      message += `Tienes ${events.length} evento(s) programado(s):\n\n`;

      events.forEach((event, index) => {
        const startTime = new Date(event.start.dateTime);
        const timeFormatted = startTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });

        message += `${index + 1}. **${event.subject}** - ${timeFormatted}\n`;
      });
    }

    const chatMessage = {
      body: {
        contentType: 'text',
        content: message,
      },
    };

    // Obtener chats del usuario
    const chats = await client.api('/me/chats').get();
    let chatId = null;

    for (const chat of chats.value) {
      if (chat.chatType === 'oneOnOne') {
        chatId = chat.id;
        break;
      }
    }

    if (chatId) {
      await client.api(`/chats/${chatId}/messages`).post(chatMessage);
      console.log('✓ Resumen diario enviado');
    }

    return true;
  } catch (error) {
    console.error('Error enviando resumen diario:', error);
    return false;
  }
}

module.exports = {
  sendReminderToUser,
  sendDailySummary,
};
