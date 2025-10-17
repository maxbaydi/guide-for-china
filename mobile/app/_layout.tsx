import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider } from '../hooks/useAuth';
import { apolloClient } from '../services/apollo';
import { lightTheme } from '../theme';
import '../services/i18n';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarBackgroundColor, setStatusBarStyle } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Настройка StatusBar для Android с edge-to-edge
    if (Platform.OS === 'android') {
      setStatusBarBackgroundColor('transparent', true);
      setStatusBarStyle('dark');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'android'}
      />
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
