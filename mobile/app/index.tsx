import { useEffect } from 'react';
import { Redirect, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';

/**
 * Корневой экран приложения
 * Перенаправляет пользователя на auth или tabs в зависимости от статуса авторизации
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Пользователь не авторизован - перенаправляем на login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Пользователь авторизован, но находится на странице auth - перенаправляем в приложение
      router.replace('/(tabs)/search');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // По умолчанию перенаправляем на login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/search" />;
}

