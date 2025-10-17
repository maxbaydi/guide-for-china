import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { LightColors, DarkColors } from './constants/Colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LightColors.primary,           // cyan-600
    onPrimary: LightColors.textInverse,
    primaryContainer: LightColors.primaryPale,
    onPrimaryContainer: LightColors.primaryDark,
    
    secondary: LightColors.secondary,       // orange-500
    onSecondary: LightColors.textInverse,
    secondaryContainer: LightColors.secondaryPale,
    onSecondaryContainer: LightColors.secondaryDark,
    
    tertiary: LightColors.blue,             // blue-600
    onTertiary: LightColors.textInverse,
    
    error: LightColors.error,
    onError: LightColors.textInverse,
    errorContainer: LightColors.errorLight,
    onErrorContainer: LightColors.error,
    
    background: LightColors.background,
    onBackground: LightColors.text,
    
    surface: LightColors.surface,
    onSurface: LightColors.text,
    surfaceVariant: LightColors.surfaceHover,
    onSurfaceVariant: LightColors.textSecondary,
    
    outline: LightColors.border,
    outlineVariant: LightColors.borderLight,
    
    shadow: LightColors.shadow,
    scrim: LightColors.overlay,
    
    inverseSurface: DarkColors.surface,
    inverseOnSurface: DarkColors.text,
    inversePrimary: DarkColors.primary,
    
    elevation: {
      level0: 'transparent',
      level1: LightColors.backgroundElevated,
      level2: LightColors.surface,
      level3: LightColors.surface,
      level4: LightColors.surface,
      level5: LightColors.surface,
    },
    
    surfaceDisabled: LightColors.borderLight,
    onSurfaceDisabled: LightColors.textTertiary,
    backdrop: LightColors.overlay,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DarkColors.primary,           // cyan-400
    onPrimary: DarkColors.textInverse,
    primaryContainer: DarkColors.primaryPale,
    onPrimaryContainer: DarkColors.primaryLight,
    
    secondary: DarkColors.secondary,       // orange-400
    onSecondary: DarkColors.textInverse,
    secondaryContainer: DarkColors.secondaryPale,
    onSecondaryContainer: DarkColors.secondaryLight,
    
    tertiary: DarkColors.blue,             // blue-400
    onTertiary: DarkColors.textInverse,
    
    error: DarkColors.error,
    onError: DarkColors.textInverse,
    errorContainer: DarkColors.errorLight,
    onErrorContainer: DarkColors.error,
    
    background: DarkColors.background,
    onBackground: DarkColors.text,
    
    surface: DarkColors.surface,
    onSurface: DarkColors.text,
    surfaceVariant: DarkColors.surfaceHover,
    onSurfaceVariant: DarkColors.textSecondary,
    
    outline: DarkColors.border,
    outlineVariant: DarkColors.borderLight,
    
    shadow: DarkColors.shadow,
    scrim: DarkColors.overlay,
    
    inverseSurface: LightColors.surface,
    inverseOnSurface: LightColors.text,
    inversePrimary: LightColors.primary,
    
    elevation: {
      level0: 'transparent',
      level1: DarkColors.backgroundElevated,
      level2: DarkColors.surface,
      level3: DarkColors.surface,
      level4: DarkColors.surfaceHover,
      level5: DarkColors.surfaceHover,
    },
    
    surfaceDisabled: DarkColors.borderDark,
    onSurfaceDisabled: DarkColors.textTertiary,
    backdrop: DarkColors.overlay,
  },
};

