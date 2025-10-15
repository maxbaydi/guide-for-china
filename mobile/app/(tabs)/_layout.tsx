import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';

/**
 * Layout для основных табов приложения
 * С индикатором активной вкладки
 */
export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark, // cyan-600
        tabBarInactiveTintColor: Colors.textLight, // gray-500
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'absolute',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 8,
          elevation: 8,
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 5,
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
