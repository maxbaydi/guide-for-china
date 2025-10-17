import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { api, saveTokens, clearTokens, rateLimits } from '../services/api';
import { User, LoginInput, RegisterInput, AuthResponse } from '../types/api.types';
import { getErrorMessage } from '../utils/errorHandler';
import { showError } from '../utils/toast';

interface RateLimits {
  limit: number;
  remaining: number;
  reset: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  rateLimitsInfo: RateLimits;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rateLimitsInfo, setRateLimitsInfo] = useState<RateLimits>({
    limit: 50,
    remaining: 50,
    reset: Date.now(),
  });

  useEffect(() => {
    loadUser();
    
    // Подписываемся на обновления rate limits
    const unsubscribe = rateLimits.subscribe((limits) => {
      setRateLimitsInfo(limits);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        // Используем skipErrorToast чтобы не показывать toast при загрузке приложения
        const { data } = await api.get<{ user: User }>('/auth/me', {
          skipErrorToast: true,
        } as any);
        setUser(data.user);
      }
    } catch (error: any) {
      console.error('Error loading user:', error);
      // Только очищаем токены при 401, не показываем ошибку
      if (error.response?.status === 401) {
        await clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (input: LoginInput) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', input, {
        skipErrorToast: true,
      } as any);
      await saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = getErrorMessage(error);
      showError(message, t('errors.loginError'));
      throw new Error(message);
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      // Исключаем confirmPassword из отправки на бэкенд
      const { confirmPassword, ...registerData } = input as any;
      
      const { data } = await api.post<AuthResponse>('/auth/register', registerData, {
        skipErrorToast: true,
      } as any);
      await saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    } catch (error: any) {
      console.error('Register error:', error);
      const message = getErrorMessage(error);
      showError(message, t('errors.registerError'));
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    rateLimitsInfo,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;

