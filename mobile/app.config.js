require('dotenv').config();

module.exports = {
  expo: {
    name: 'HanGuide',
    slug: 'hanguide',
    version: '1.0.0',
    scheme: 'hanguide',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.hanguide.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.hanguide.app',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-router',
        {
          root: './app',
        },
      ],
      'expo-secure-store',
      'expo-localization',
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'hanguide-mobile',
      },
      // API URLs из .env
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL,
      graphqlUrl: process.env.EXPO_PUBLIC_GRAPHQL_URL || process.env.GRAPHQL_URL,
    },
  },
};

