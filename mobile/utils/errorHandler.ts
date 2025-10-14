import { GraphQLError } from 'graphql';
import { AxiosError } from 'axios';

/**
 * Утилиты для обработки и форматирования ошибок
 */

// Маппинг известных ошибок на русские сообщения
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'Invalid credentials': 'Неверный email или пароль',
  'User not found': 'Пользователь не найден',
  'User already exists': 'Пользователь с таким email уже существует',
  'Email already exists': 'Email уже используется',
  'Username already exists': 'Имя пользователя уже занято',
  'Invalid token': 'Недействительный токен',
  'Token expired': 'Токен истек',
  'Unauthorized': 'Требуется авторизация',
  'Account deactivated': 'Аккаунт деактивирован',
  
  // Profile errors
  'Bad Request Exception': 'Неверный запрос',
  'Username can only contain letters, numbers, and underscores': 'Имя пользователя может содержать только буквы, цифры и подчеркивания',
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character': 'Пароль должен содержать минимум 8 символов: заглавные и строчные буквы, цифры и спецсимволы',
  'Current password is incorrect': 'Неверный текущий пароль',
  
  // Collection errors
  'Collection not found': 'Коллекция не найдена',
  'Character already exists in this collection': 'Иероглиф уже есть в этой коллекции',
  'Character not found in collection': 'Иероглиф не найден в коллекции',
  'You do not have access to this collection': 'У вас нет доступа к этой коллекции',
  
  // Network errors
  'Network Error': 'Ошибка сети. Проверьте подключение к интернету',
  'Request failed with status code 500': 'Ошибка сервера. Попробуйте позже',
  'Request failed with status code 503': 'Сервис временно недоступен',
  'timeout': 'Превышено время ожидания',
  
  // Dictionary errors
  'Character not found': 'Иероглиф не найден',
  'Search failed': 'Ошибка поиска',
  'Analysis failed': 'Ошибка анализа текста',
};

/**
 * Форматирует GraphQL ошибку в понятное сообщение
 */
export const formatGraphQLError = (error: GraphQLError | any): string => {
  const message = error.message || '';
  
  // Проверяем известные ошибки
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  // Возвращаем оригинальное сообщение, если не нашли маппинг
  return message || 'Произошла неизвестная ошибка';
};

/**
 * Форматирует Axios/API ошибку в понятное сообщение
 */
export const formatApiError = (error: AxiosError | any): string => {
  if (!error.response) {
    // Ошибка сети
    if (error.message === 'Network Error') {
      return ERROR_MESSAGES['Network Error'];
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return ERROR_MESSAGES['timeout'];
    }
    return 'Ошибка соединения с сервером';
  }
  
  const status = error.response.status;
  const message = error.response.data?.message || error.message || '';
  
  // Проверяем известные сообщения об ошибках
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  // Обработка по кодам статуса
  switch (status) {
    case 400:
      return message || 'Неверный запрос';
    case 401:
      return 'Требуется авторизация';
    case 403:
      return 'Доступ запрещен';
    case 404:
      return 'Не найдено';
    case 409:
      return message || 'Конфликт данных';
    case 429:
      return 'Слишком много запросов. Попробуйте позже';
    case 500:
      return ERROR_MESSAGES['Request failed with status code 500'];
    case 503:
      return ERROR_MESSAGES['Request failed with status code 503'];
    default:
      return message || 'Произошла ошибка';
  }
};

/**
 * Извлекает сообщение об ошибке из любого типа ошибки
 */
export const getErrorMessage = (error: any): string => {
  // GraphQL error
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    return formatGraphQLError(error.graphQLErrors[0]);
  }
  
  // Network error from Apollo
  if (error.networkError) {
    return formatApiError(error.networkError);
  }
  
  // Axios error
  if (error.isAxiosError) {
    return formatApiError(error);
  }
  
  // Generic error with message
  if (error.message) {
    // Проверяем известные сообщения
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return value;
      }
    }
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};


