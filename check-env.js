// Script para verificar variables de entorno
console.log('=== Verificando variables de entorno ===\n');

const envVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REDIRECT_URI',
  'SESSION_SECRET',
  'NODE_ENV',
  'PORT'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mostrar solo los primeros caracteres para seguridad
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`✓ ${varName}: ${preview}`);
  } else {
    console.log(`✗ ${varName}: NO DEFINIDA`);
  }
});

console.log('\n=== Todas las variables disponibles ===');
console.log(Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('REDIRECT') || k.includes('SESSION')));
