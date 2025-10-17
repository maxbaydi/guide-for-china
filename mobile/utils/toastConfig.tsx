import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { LightColors, DarkColors } from '../constants/Colors';

/**
 * Создает конфигурацию Toast с учетом текущей темы
 * @param theme - объект с цветами текущей темы (LightColors или DarkColors)
 */
export const getToastConfig = (theme: typeof LightColors | typeof DarkColors): ToastConfig => ({
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.success,
        borderLeftWidth: 5,
        backgroundColor: theme.surface,
        borderRightColor: theme.border,
        borderRightWidth: 1,
        borderTopColor: theme.border,
        borderTopWidth: 1,
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: theme.surface,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
      }}
      text2Style={{
        fontSize: 13,
        color: theme.textSecondary,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: theme.error,
        borderLeftWidth: 5,
        backgroundColor: theme.surface,
        borderRightColor: theme.border,
        borderRightWidth: 1,
        borderTopColor: theme.border,
        borderTopWidth: 1,
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: theme.surface,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
      }}
      text2Style={{
        fontSize: 13,
        color: theme.textSecondary,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.primary,
        borderLeftWidth: 5,
        backgroundColor: theme.surface,
        borderRightColor: theme.border,
        borderRightWidth: 1,
        borderTopColor: theme.border,
        borderTopWidth: 1,
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: theme.surface,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
      }}
      text2Style={{
        fontSize: 13,
        color: theme.textSecondary,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
});

