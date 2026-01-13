const { google } = require('googleapis');
const config = require('./config');

// Crear cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

/**
 * Genera la URL de autorización para iniciar el flujo OAuth
 */
function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: config.google.scopes,
    prompt: 'consent', // Fuerza a mostrar la pantalla de consentimiento
  });

  return authUrl;
}

/**
 * Intercambia el código de autorización por tokens de acceso
 */
async function getTokenFromCode(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    throw error;
  }
}

/**
 * Refresca el token de acceso usando el refresh token
 */
async function refreshAccessToken(refreshToken) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refrescando token:', error);
    throw error;
  }
}

/**
 * Obtiene un cliente OAuth2 autenticado
 */
function getAuthenticatedClient(tokens) {
  const client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
  
  client.setCredentials(tokens);
  return client;
}

module.exports = {
  getAuthUrl,
  getTokenFromCode,
  refreshAccessToken,
  getAuthenticatedClient,
  oauth2Client,
};
