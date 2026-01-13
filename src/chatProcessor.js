const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuth');

/**
 * Detecta si el mensaje contiene fecha y/o hora
 */
function hasDateOrTime(message) {
  const lowerMessage = message.toLowerCase();
  
  const datePatterns = [
    /mañana|tomorrow/i,
    /hoy|today/i,
    /lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo/i,
    /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i,
  ];
  
  const timePattern = /\d{1,2}:?\d{0,2}\s*(am|pm|hrs|h)/i;
  
  const hasDate = datePatterns.some(pattern => pattern.test(message));
  const hasTime = timePattern.test(message);
  
  return { hasDate, hasTime, hasBoth: hasDate && hasTime };
}

/**
 * Procesa un mensaje de chat y extrae información del evento
 */
function parseEventFromMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  // Patrones comunes en español
  const patterns = {
    // "reunión con Juan mañana a las 3pm"
    tomorrow: /mañana|tomorrow/i,
    today: /hoy|today/i,
    // Días de la semana
    monday: /lunes|monday/i,
    tuesday: /martes|tuesday/i,
    wednesday: /miércoles|miercoles|wednesday/i,
    thursday: /jueves|thursday/i,
    friday: /viernes|friday/i,
    saturday: /sábado|sabado|saturday/i,
    sunday: /domingo|sunday/i,
    // Horas
    time: /(\d{1,2}):?(\d{2})?\s*(am|pm|hrs|h)?/i,
  };

  let eventData = {
    summary: '',
    start: null,
    end: null,
    description: message,
  };

  // Extraer el título del evento
  const titlePatterns = [
    /(?:recordar|recordatorio|agregar|crear|evento)[\s:]+(.*?)(?:\s+(?:mañana|hoy|el|a las|para|en))/i,
    /(?:reunión|junta|cita|llamada)\s+(?:con\s+)?([^0-9]+?)(?:\s+(?:mañana|hoy|el|a las))/i,
  ];

  for (const pattern of titlePatterns) {
    const match = message.match(pattern);
    if (match) {
      eventData.summary = match[1].trim();
      break;
    }
  }

  // Si no encontró título, usar todo el mensaje hasta la fecha/hora
  if (!eventData.summary) {
    const beforeTime = message.split(/\d{1,2}:?\d{0,2}\s*(am|pm|hrs)?/i)[0];
    const beforeDate = beforeTime.split(/mañana|hoy|lunes|martes|miércoles|jueves|viernes|sábado|domingo/i)[0];
    eventData.summary = beforeDate.replace(/recordar|recordatorio|agregar|crear|evento|:/gi, '').trim();
  }

  // Determinar fecha
  const now = new Date();
  let eventDate = new Date();

  if (patterns.tomorrow.test(message)) {
    eventDate.setDate(now.getDate() + 1);
  } else if (patterns.today.test(message)) {
    eventDate = new Date();
  } else {
    // Revisar días de la semana
    const daysMap = {
      lunes: 1, monday: 1,
      martes: 2, tuesday: 2,
      miércoles: 3, miercoles: 3, wednesday: 3,
      jueves: 4, thursday: 4,
      viernes: 5, friday: 5,
      sábado: 6, sabado: 6, saturday: 6,
      domingo: 0, sunday: 0,
    };

    for (const [dayName, dayNum] of Object.entries(daysMap)) {
      if (lowerMessage.includes(dayName)) {
        const currentDay = now.getDay();
        let daysUntil = dayNum - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        eventDate.setDate(now.getDate() + daysUntil);
        break;
      }
    }
  }

  // Extraer hora
  const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|hrs|h)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];

    // Convertir a formato 24 horas
    if (period && period.toLowerCase().includes('pm') && hours < 12) {
      hours += 12;
    } else if (period && period.toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }

    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    // Si no hay hora específica, poner a las 9 AM
    eventDate.setHours(9, 0, 0, 0);
  }

  // Crear fecha de fin (1 hora después)
  const endDate = new Date(eventDate);
  endDate.setHours(endDate.getHours() + 1);

  eventData.start = {
    dateTime: eventDate.toISOString(),
    timeZone: 'America/Mexico_City',
  };

  eventData.end = {
    dateTime: endDate.toISOString(),
    timeZone: 'America/Mexico_City',
  };

  return eventData;
}

/**
 * Crea una tarea/recordatorio (sin fecha específica)
 */
async function createReminderTask(tokens, message) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const tasks = google.tasks({ version: 'v1', auth });

    // Limpiar el mensaje para obtener solo la tarea
    const taskTitle = message
      .replace(/^(recordar|recordatorio|agregar|crear|tarea)[:\s]*/i, '')
      .trim();

    if (!taskTitle || taskTitle.length < 2) {
      return {
        success: false,
        error: 'Por favor incluye más detalles sobre la tarea.',
      };
    }

    // Crear la tarea en Google Tasks
    const response = await tasks.tasks.insert({
      tasklist: '@default',
      requestBody: {
        title: taskTitle,
        notes: message,
      },
    });

    return {
      success: true,
      task: response.data,
      message: `✅ Recordatorio creado: "${taskTitle}"`,
    };
  } catch (error) {
    console.error('Error creando recordatorio:', error);
    return {
      success: false,
      error: 'Hubo un error al crear el recordatorio. Intenta de nuevo.',
    };
  }
}

/**
 * Crea un evento en Google Calendar desde un mensaje
 */
async function createEventFromChat(tokens, message) {
  try {
    const auth = getAuthenticatedClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    const eventData = parseEventFromMessage(message);

    // Validar que tenga al menos un título
    if (!eventData.summary || eventData.summary.length < 2) {
      return {
        success: false,
        error: 'No pude entender el evento. Por favor incluye más detalles.',
      };
    }

    // Crear el evento
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
    });

    return {
      success: true,
      event: response.data,
      message: `✅ Evento creado: "${eventData.summary}" - ${new Date(eventData.start.dateTime).toLocaleString('es-ES')}`,
    };
  } catch (error) {
    console.error('Error creando evento:', error);
    return {
      success: false,
      error: 'Hubo un error al crear el evento. Intenta de nuevo.',
    };
  }
}

/**
 * Procesa un mensaje del chat y decide si crear evento o recordatorio
 */
async function processMessage(tokens, message) {
  const detection = hasDateOrTime(message);
  
  // Si tiene fecha Y hora, crear evento en calendario
  if (detection.hasBoth) {
    return await createEventFromChat(tokens, message);
  }
  
  // Si NO tiene fecha ni hora, crear recordatorio/tarea
  if (!detection.hasDate && !detection.hasTime) {
    return await createReminderTask(tokens, message);
  }
  
  // Si tiene solo fecha O solo hora (ambiguo), crear evento por defecto
  return await createEventFromChat(tokens, message);
}

module.exports = {
  parseEventFromMessage,
  createEventFromChat,
  createReminderTask,
  processMessage,
  hasDateOrTime,
};
