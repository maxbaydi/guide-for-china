import fs from 'fs';
import path from 'path';
import { Language, TranslationNamespace } from '../i18n.types';
import { initI18n, getTranslation } from '../i18n.config';

describe('i18n Configuration', () => {
  const localesPath = path.join(__dirname, '../../../../locales');

  describe('Translation files structure', () => {
    it('should have all required language directories', () => {
      const languages = Object.values(Language);
      
      languages.forEach((lang) => {
        const langPath = path.join(localesPath, lang);
        expect(fs.existsSync(langPath)).toBe(true);
      });
    });

    it('should have all required namespace files for each language', () => {
      const languages = Object.values(Language);
      const namespaces = Object.values(TranslationNamespace);

      languages.forEach((lang) => {
        namespaces.forEach((ns) => {
          const filePath = path.join(localesPath, lang, `${ns}.json`);
          expect(fs.existsSync(filePath)).toBe(true);
        });
      });
    });

    it('should have valid JSON in all translation files', () => {
      const languages = Object.values(Language);
      const namespaces = Object.values(TranslationNamespace);

      languages.forEach((lang) => {
        namespaces.forEach((ns) => {
          const filePath = path.join(localesPath, lang, `${ns}.json`);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          expect(() => JSON.parse(content)).not.toThrow();
        });
      });
    });
  });

  describe('Translation keys consistency', () => {
    function getKeys(obj: any, prefix = ''): string[] {
      let keys: string[] = [];
      
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys = keys.concat(getKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      
      return keys;
    }

    it('should have matching keys structure in all languages for common namespace', () => {
      const ruCommonPath = path.join(localesPath, Language.RU, `${TranslationNamespace.COMMON}.json`);
      const zhCommonPath = path.join(localesPath, Language.ZH, `${TranslationNamespace.COMMON}.json`);

      const ruCommon = JSON.parse(fs.readFileSync(ruCommonPath, 'utf-8'));
      const zhCommon = JSON.parse(fs.readFileSync(zhCommonPath, 'utf-8'));

      const ruKeys = getKeys(ruCommon).sort();
      const zhKeys = getKeys(zhCommon).sort();

      expect(ruKeys).toEqual(zhKeys);
    });

    it('should have matching keys structure in all languages for errors namespace', () => {
      const ruErrorsPath = path.join(localesPath, Language.RU, `${TranslationNamespace.ERRORS}.json`);
      const zhErrorsPath = path.join(localesPath, Language.ZH, `${TranslationNamespace.ERRORS}.json`);

      const ruErrors = JSON.parse(fs.readFileSync(ruErrorsPath, 'utf-8'));
      const zhErrors = JSON.parse(fs.readFileSync(zhErrorsPath, 'utf-8'));

      const ruKeys = getKeys(ruErrors).sort();
      const zhKeys = getKeys(zhErrors).sort();

      expect(ruKeys).toEqual(zhKeys);
    });

    it('should have matching keys structure in all languages for validation namespace', () => {
      const ruValidationPath = path.join(localesPath, Language.RU, `${TranslationNamespace.VALIDATION}.json`);
      const zhValidationPath = path.join(localesPath, Language.ZH, `${TranslationNamespace.VALIDATION}.json`);

      const ruValidation = JSON.parse(fs.readFileSync(ruValidationPath, 'utf-8'));
      const zhValidation = JSON.parse(fs.readFileSync(zhValidationPath, 'utf-8'));

      const ruKeys = getKeys(ruValidation).sort();
      const zhKeys = getKeys(zhValidation).sort();

      expect(ruKeys).toEqual(zhKeys);
    });

    it('should have non-empty values for Russian language', () => {
      const namespaces = Object.values(TranslationNamespace);
      
      namespaces.forEach((ns) => {
        const filePath = path.join(localesPath, Language.RU, `${ns}.json`);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const keys = getKeys(content);
        
        keys.forEach((key) => {
          const value = key.split('.').reduce((obj, k) => obj[k], content);
          expect(value).toBeTruthy();
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('i18next initialization', () => {
    it('should initialize i18next successfully', async () => {
      const i18n = await initI18n(localesPath);
      
      expect(i18n).toBeDefined();
      expect(i18n.isInitialized).toBe(true);
    });

    it('should use Russian as default language', async () => {
      const i18n = await initI18n(localesPath);
      
      expect(i18n.language).toBe(Language.RU);
    });

    it('should load all namespaces', async () => {
      const i18n = await initI18n(localesPath);
      const namespaces = Object.values(TranslationNamespace);
      
      namespaces.forEach((ns) => {
        expect(i18n.hasResourceBundle(Language.RU, ns)).toBe(true);
      });
    });
  });

  describe('Translation function', () => {
    beforeAll(async () => {
      await initI18n(localesPath);
    });

    it('should translate Russian keys correctly', () => {
      const t = getTranslation(Language.RU);
      
      expect(t('app.name')).toBe('Гид по Китаю');
      expect(t('auth.login')).toBe('Вход');
      expect(t('dictionary.search')).toBe('Поиск');
    });

    it('should translate error keys correctly', () => {
      const t = getTranslation(Language.RU);
      
      expect(t('validation.required', { ns: TranslationNamespace.ERRORS })).toBe('Поле обязательно для заполнения');
      expect(t('auth.unauthorized', { ns: TranslationNamespace.ERRORS })).toBe('Необходима авторизация');
    });

    it('should support interpolation', () => {
      const t = getTranslation(Language.RU);
      
      expect(t('string.min', { ns: TranslationNamespace.VALIDATION, min: 8 })).toBe('Минимальная длина: 8 символов');
    });

    it('should return key if translation not found', () => {
      const t = getTranslation(Language.RU);
      
      const nonExistentKey = 'nonexistent.key';
      expect(t(nonExistentKey)).toBe(nonExistentKey);
    });
  });
});

