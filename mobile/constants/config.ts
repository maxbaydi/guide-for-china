import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Получение переменных окружения из .env через expo-constants
const expoExtra = Constants.expoConfig?.extra || {};
const ENV_API_URL = expoExtra.apiBaseUrl;
const ENV_GRAPHQL_URL = expoExtra.graphqlUrl;

// Определение URL для разных платформ
const getApiUrl = () => {
  // Если указан URL в .env - используем его (для реальных устройств)
  if (ENV_API_URL) {
    return ENV_API_URL;
  }
  
  if (__DEV__) {
    // В режиме разработки - fallback значения
    if (Platform.OS === 'android') {
      // Android эмулятор использует 10.0.2.2 для localhost
      return 'http://10.0.2.2:4000/api/v1';
    } else if (Platform.OS === 'ios') {
      // iOS симулятор может использовать localhost
      return 'http://localhost:4000/api/v1';
    } else {
      // Web
      return 'http://localhost:4000/api/v1';
    }
  }
  // Production URL
  return 'https://api.hanguide.com/api/v1';
};

const getGraphQLUrl = () => {
  // Если указан URL в .env - используем его
  if (ENV_GRAPHQL_URL) {
    return ENV_GRAPHQL_URL;
  }
  
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4002/graphql';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:4002/graphql';
    } else {
      return 'http://localhost:4002/graphql';
    }
  }
  return 'https://api.hanguide.com/graphql';
};

const baseUrl = getApiUrl();
const graphqlUrl = getGraphQLUrl();

// Debug logging
console.log('🔧 API Configuration:');
console.log('  BASE_URL:', baseUrl);
console.log('  GRAPHQL_URL:', graphqlUrl);
console.log('  ENV_API_URL:', ENV_API_URL);
console.log('  ENV_GRAPHQL_URL:', ENV_GRAPHQL_URL);
console.log('  Platform:', Platform.OS);

export const API_CONFIG = {
  BASE_URL: baseUrl,
  GRAPHQL_URL: graphqlUrl,
  TIMEOUT: 60000, // 60 секунд (увеличено для анализа текста)
};

export const APP_CONFIG = {
  DEFAULT_LANGUAGE: 'ru',
  SUPPORTED_LANGUAGES: ['ru', 'zh'],
  SEARCH_HISTORY_LIMIT: 10,
  SEARCH_DEBOUNCE_MS: 300,
};

