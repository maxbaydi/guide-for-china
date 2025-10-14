import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from './constants/Colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    error: Colors.error,
    background: Colors.background,
    surface: Colors.white,
    surfaceVariant: Colors.backgroundLight,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.textLight,
    outline: Colors.border,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    error: Colors.error,
  },
};

