import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, saveTokens, clearTokens } from '../services/api';
import { User, LoginInput, RegisterInput, AuthResponse } from '../types/api.types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
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
      const { data } = await api.post<AuthResponse>('/auth/login', input);
      await saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Ошибка входа';
      throw new Error(message);
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', input);
      await saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || error.message || 'Ошибка регистрации';
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

