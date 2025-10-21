import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing } from '../../constants/Colors';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';

/**
 * Layout для основных табов приложения
 * С улучшенным дизайном и поддержкой темной темы
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: Spacing.md,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: Spacing.xs,
          marginBottom: Platform.OS === 'ios' ? Spacing.xs : 0,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: Spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: t('search.title'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name="magnify"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: t('analyze.title'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name="text-search"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: t('collections.title'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'account-circle' : 'account-circle-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
