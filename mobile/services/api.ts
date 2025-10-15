import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';
import { showError } from '../utils/toast';
import { formatApiError } from '../utils/errorHandler';

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

// Request interceptor - добавление токена авторизации
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return config;
  },
  (error) => {
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

    // Если 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (!refreshToken) {
          // Нет refresh token - требуется повторный вход
          await clearTokens();
          if (!originalRequest.skipErrorToast) {
            showError('Сессия истекла. Пожалуйста, войдите снова');
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
          showError('Сессия истекла. Пожалуйста, войдите снова');
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

export default api;

