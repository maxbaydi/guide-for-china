import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../hooks/useAuth';
import { apolloClient } from '../services/apollo';
import { lightTheme } from '../theme';
import '../services/i18n';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <ApolloProvider client={apolloClient}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </AuthProvider>
          </QueryClientProvider>
        </ApolloProvider>
      </PaperProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
