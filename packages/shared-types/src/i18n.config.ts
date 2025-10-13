import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { Language, TranslationNamespace } from './i18n.types';

/**
 * Initialize i18next with file system backend
 */
export async function initI18n(localesPath: string) {
  await i18next.use(Backend).init({
    lng: Language.RU,
    fallbackLng: Language.RU,
    ns: [
      TranslationNamespace.COMMON,
      TranslationNamespace.ERRORS,
      TranslationNamespace.VALIDATION,
    ],
    defaultNS: TranslationNamespace.COMMON,
    backend: {
      loadPath: path.join(localesPath, '{{lng}}/{{ns}}.json'),
    },
    interpolation: {
      escapeValue: false,
    },
  });

  return i18next;
}

/**
 * Get translation function
 */
export function getTranslation(language: Language = Language.RU) {
  return i18next.getFixedT(language);
}

export { i18next };

