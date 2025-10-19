// Load environment variables
const dotenv = require('dotenv');
const path = require('path');

// Load .env.production if it exists, otherwise use .env
const envPath = process.env.EAS_BUILD 
  ? path.resolve(__dirname, '.env.production')
  : path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });

// Get API URLs from environment variables
// При сборке EAS приоритет у переменных окружения из eas.json
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.88:4000/api/v1';
const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://192.168.31.88:4002/graphql';

console.log('📱 Mobile App Configuration:');
console.log('  EAS_BUILD:', process.env.EAS_BUILD);
console.log('  API_BASE_URL:', apiBaseUrl);
console.log('  GRAPHQL_URL:', graphqlUrl);
console.log('  ENV_PATH:', envPath);

module.exports = {
  ...require('./app.json').expo,
  extra: {
    ...require('./app.json').expo.extra,
    apiBaseUrl,
    graphqlUrl
  },
  android: {
    ...require('./app.json').expo.android,
    package: 'com.hanguide.app',
    usesCleartextTraffic: false,
    networkSecurityConfig: './network_security_config.xml'
  },
  ios: {
    ...require('./app.json').expo.ios,
    bundleIdentifier: 'com.hanguide.app',
  }
};