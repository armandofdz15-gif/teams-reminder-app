const msal = require('@azure/msal-node');
const config = require('./config');

// Configuración de MSAL
const msalConfig = {
  auth: {
    clientId: config.auth.clientId,
    authority: config.auth.authority,
    clientSecret: config.auth.clientSecret,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        if (!containsPii) {
          console.log(message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Warning,
    },
  },
};

// Crear instancia de MSAL
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Genera la URL de autorización para iniciar el flujo OAuth
 */
async function getAuthUrl() {
  const authCodeUrlParameters = {
    scopes: config.graph.scopes,
    redirectUri: config.auth.redirectUri,
  };

  try {
    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    return authUrl;
  } catch (error) {
    console.error('Error generando URL de autorización:', error);
    throw error;
  }
}

/**
 * Intercambia el código de autorización por tokens de acceso
 */
async function getTokenFromCode(code) {
  const tokenRequest = {
    code: code,
    scopes: config.graph.scopes,
    redirectUri: config.auth.redirectUri,
  };

  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    return response;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    throw error;
  }
}

/**
 * Obtiene un token de acceso válido usando el refresh token si es necesario
 */
async function getAccessToken(account) {
  const silentRequest = {
    account: account,
    scopes: config.graph.scopes,
  };

  try {
    const response = await cca.acquireTokenSilent(silentRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error obteniendo token silencioso:', error);
    throw error;
  }
}

/**
 * Refresca el token de acceso usando el refresh token
 */
async function refreshAccessToken(refreshToken) {
  const refreshRequest = {
    refreshToken: refreshToken,
    scopes: config.graph.scopes,
  };

  try {
    const response = await cca.acquireTokenByRefreshToken(refreshRequest);
    return response;
  } catch (error) {
    console.error('Error refrescando token:', error);
    throw error;
  }
}

module.exports = {
  getAuthUrl,
  getTokenFromCode,
  getAccessToken,
  refreshAccessToken,
  cca,
};
