import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, Shadows, DarkShadows } from '../constants/Colors';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: typeof LightColors;
  shadows: typeof Shadows;
  themeType: ThemeType;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@hanguide_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Определяем активную тему на основе режима
  const getActiveTheme = (mode: ThemeMode): ThemeType => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };

  const [activeTheme, setActiveTheme] = useState<ThemeType>(getActiveTheme(themeMode));

  // Загрузка сохраненного режима темы при запуске
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Обновление активной темы при изменении режима или системной темы
  useEffect(() => {
    setActiveTheme(getActiveTheme(themeMode));
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const theme = activeTheme === 'dark' ? DarkColors : LightColors;
  const shadows = activeTheme === 'dark' ? DarkShadows : Shadows;
  const isDark = activeTheme === 'dark';

  const value: ThemeContextType = {
    theme,
    shadows,
    themeType: activeTheme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

