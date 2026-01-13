const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

/**
 * Crea un cliente autenticado de Microsoft Graph
 * @param {string} accessToken - Token de acceso para autenticación
 * @returns {Client} Cliente de Microsoft Graph configurado
 */
function getAuthenticatedClient(accessToken) {
  // Inicializar el cliente de Graph
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  return client;
}

module.exports = {
  getAuthenticatedClient,
};
