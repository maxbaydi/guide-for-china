import { LoginInput, RegisterInput, AuthResponse, User } from '../types/api.types';

/**
 * Mock API для тестирования без бэкенда
 * Используется когда API недоступен
 */

// Симуляция задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Временное хранилище пользователей (в памяти)
const mockUsers: Record<string, { email: string; password: string; username?: string }> = {};

// Генерация mock токенов
const generateMockToken = () => {
  return 'mock_' + Math.random().toString(36).substring(2, 15);
};

// Создание mock пользователя
const createMockUser = (email: string, username?: string): User => {
  return {
    id: Math.random().toString(36).substring(2, 15),
    email,
    username: username || email.split('@')[0],
    displayName: username || email.split('@')[0],
    subscriptionTier: 'FREE',
    dailyRequestsUsed: 0,
    dailyRequestsLimit: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const mockLogin = async (input: LoginInput): Promise<AuthResponse> => {
  await delay(800); // Симуляция задержки сети

  const user = mockUsers[input.email];
  
  if (!user || user.password !== input.password) {
    throw new Error('Неверный email или пароль');
  }

  return {
    user: createMockUser(user.email, user.username),
    accessToken: generateMockToken(),
    refreshToken: generateMockToken(),
  };
};

export const mockRegister = async (input: RegisterInput): Promise<AuthResponse> => {
  await delay(800);

  if (mockUsers[input.email]) {
    throw new Error('Пользователь с таким email уже существует');
  }

  mockUsers[input.email] = {
    email: input.email,
    password: input.password,
    username: input.username,
  };

  return {
    user: createMockUser(input.email, input.username),
    accessToken: generateMockToken(),
    refreshToken: generateMockToken(),
  };
};

export const mockGetMe = async (): Promise<User> => {
  await delay(500);
  
  // Возвращаем тестового пользователя
  return createMockUser('test@example.com', 'testuser');
};

export const mockLogout = async (): Promise<void> => {
  await delay(300);
  // Ничего не делаем в mock версии
};

