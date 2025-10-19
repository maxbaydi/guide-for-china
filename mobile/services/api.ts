import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';
import { showError } from '../utils/toast';
import { formatApiError } from '../utils/errorHandler';
import i18n from './i18n';

/**
 * Axios instance для работы с REST API
 * Автоматически добавляет токены и обрабатывает refresh
 */

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Логирование всех запросов для отладки
console.log('📡 API Client Configuration:');
console.log('  Base URL:', API_CONFIG.BASE_URL);
console.log('  Timeout:', API_CONFIG.TIMEOUT);
console.log('  Self-signed certificate support: ENABLED via Network Security Config');

// Request interceptor - добавление токена авторизации
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Логируем запрос для отладки
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Глобальный объект для хранения rate limits
export const rateLimits = {
  limit: 50,
  remaining: 50,
  reset: Date.now(),
  listeners: [] as Array<(limits: { limit: number; remaining: number; reset: number }) => void>,
  
  update(limit: number, remaining: number, reset: number) {
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
    this.listeners.forEach(listener => listener({ limit, remaining, reset }));
  },
  
  subscribe(listener: (limits: { limit: number; remaining: number; reset: number }) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
};

// Response interceptor - обработка ошибок и refresh token
api.interceptors.response.use(
  (response) => {
    // Читаем заголовки rate-limit из ответа
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    
    if (limit && remaining && reset) {
      rateLimits.update(
        parseInt(limit, 10),
        parseInt(remaining, 10),
        parseInt(reset, 10)
      );
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; skipErrorToast?: boolean };

    // Детальное логирование ошибки для отладки
    if (!error.response) {
      console.error('❌ Network Error:', {
        message: error.message,
        code: error.code,
        url: originalRequest?.url,
        baseURL: API_CONFIG.BASE_URL,
      });
      
      // Специальное сообщение для SSL ошибок
      if (error.message?.includes('SSL') || error.message?.includes('certificate')) {
        console.error('🔒 SSL Certificate Error - Check Network Security Config');
      }
    } else {
      console.error(`❌ HTTP ${error.response.status}:`, originalRequest?.url);
    }

    // Если 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (!refreshToken) {
          // Нет refresh token - требуется повторный вход
          await clearTokens();
          if (!originalRequest.skipErrorToast) {
            showError(i18n.t('errors.sessionExpired'));
          }
          return Promise.reject(error);
        }

        // Попытка обновить токен
        const { data } = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        // Сохраняем новые токены
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        // Повторяем оригинальный запрос с новым токеном
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        
        return api.request(originalRequest);
      } catch (refreshError) {
        // Refresh не удался - очищаем токены
        await clearTokens();
        if (!originalRequest.skipErrorToast) {
          showError(i18n.t('errors.sessionExpired'));
        }
        return Promise.reject(refreshError);
      }
    }

    // Показываем toast для других ошибок (кроме случаев, когда явно запрещено)
    if (!originalRequest.skipErrorToast && error.response?.status !== 401) {
      const errorMessage = formatApiError(error);
      showError(errorMessage);
    }

    return Promise.reject(error);
  }
);

/**
 * Очистка токенов из secure storage
 */
export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Сохранение токенов в secure storage
 */
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

/**
 * Получение access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Синтез речи для китайского текста
 */
export const synthesizeSpeech = async (text: string): Promise<{ audioUrl: string; cached: boolean }> => {
  try {
    const { data } = await api.post('/tts/synthesize', { text });
    return data;
  } catch (error) {
    console.error('TTS synthesis failed:', error);
    throw error;
  }
};

export default api;

