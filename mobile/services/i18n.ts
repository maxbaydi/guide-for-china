import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импорт переводов
import ruCommon from '../locales/ru/common.json';
import zhCommon from '../locales/zh/common.json';

const resources = {
  ru: {
    common: ruCommon,
  },
  zh: {
    common: zhCommon,
  },
};

// Получение языка устройства
const getDeviceLanguage = (): string => {
  const locale = Localization.getLocales()[0];
  const languageCode = locale?.languageCode || 'ru';
  
  // Проверяем, поддерживается ли язык
  if (languageCode === 'zh' || languageCode === 'ru') {
    return languageCode;
  }
  
  // По умолчанию русский
  return 'ru';
};

// Загрузка сохраненного языка
const loadSavedLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('appLanguage');
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'zh')) {
      return savedLanguage;
    }
  } catch (error) {
    console.error('Failed to load saved language:', error);
  }
  return getDeviceLanguage();
};

// Сохранение выбранного языка
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('appLanguage', language);
  } catch (error) {
    console.error('Failed to save language:', error);
  }
};

// Инициализация i18n
const initI18n = async () => {
  const language = await loadSavedLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'ru',
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false, // React уже безопасен от XSS
      },
      
      react: {
        useSuspense: false,
      },
      
      compatibilityJSON: 'v4', // Для совместимости с Expo
    });
};

// Запускаем инициализацию
initI18n();

export default i18n;

