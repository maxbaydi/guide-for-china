import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'ru',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React уже безопасен от XSS
    },
    
    react: {
      useSuspense: false,
    },
    
    compatibilityJSON: 'v3', // Для совместимости с Expo
  });

export default i18n;

