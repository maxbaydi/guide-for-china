import Toast from 'react-native-toast-message';
import i18n from '../services/i18n';

/**
 * Утилиты для отображения toast уведомлений
 */

export const showSuccess = (message: string, title?: string) => {
  Toast.show({
    type: 'success',
    text1: title || i18n.t('common.success'),
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
  });
};

export const showError = (message: string, title?: string) => {
  Toast.show({
    type: 'error',
    text1: title || i18n.t('common.error'),
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    topOffset: 60,
  });
};

export const showInfo = (message: string, title?: string) => {
  Toast.show({
    type: 'info',
    text1: title || i18n.t('common.info'),
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
  });
};

export const showWarning = (message: string, title?: string) => {
  Toast.show({
    type: 'info', // Toast не имеет встроенного типа warning, используем info
    text1: title || i18n.t('common.warning'),
    text2: message,
    position: 'top',
    visibilityTime: 3500,
    topOffset: 60,
  });
};



