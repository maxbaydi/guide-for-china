/**
 * Утилиты для нормализации текстовых запросов
 * Приводят запросы к единообразному виду для эффективного поиска
 */

import { pinyin } from 'pinyin-pro';

/**
 * Нормализует пиньин: удаляет тоны, диакритику, приводит к нижнему регистру
 * Примеры:
 * - "nǐhǎo" → "nihao"
 * - "ni3hao3" → "nihao"
 * - "NiHao" → "nihao"
 * - "lü" → "lv"
 * 
 * @param text - строка пиньина для нормализации
 * @returns нормализованная строка пиньина
 */
export function normalizePinyin(text: string): string {
  return text
    .toLowerCase()
    // Замена ü на v ПЕРЕД normalize (иначе ü превратится в u + диакритика)
    .replace(/ü/g, 'v')
    .replace(/ǖ/g, 'v')
    .replace(/ǘ/g, 'v')
    .replace(/ǚ/g, 'v')
    .replace(/ǜ/g, 'v')
    // Нормализация Unicode (NFD) для разделения базовых символов и диакритики
    .normalize('NFD')
    // Удаление диакритических знаков (тонов)
    .replace(/[\u0300-\u036f]/g, '')
    // Удаление числовых обозначений тонов (1-5, включая нейтральный тон)
    .replace(/[0-9]/g, '')
    // Удаление лишних пробелов
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Нормализует русский текст: приводит к нижнему регистру, убирает лишние пробелы
 * Примеры:
 * - "ПРИВЕТ" → "привет"
 * - "Как   дела" → "как дела"
 * 
 * @param text - русская строка для нормализации
 * @returns нормализованная русская строка
 */
export function normalizeRussian(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Нормализует китайский текст: удаляет лишние пробелы
 * Примечание: китайский текст обычно не содержит пробелов между иероглифами
 * 
 * @param text - китайская строка для нормализации
 * @returns нормализованная китайская строка
 */
export function normalizeChinese(text: string): string {
  return text
    .trim()
    // Удаляем все пробелы между иероглифами
    .replace(/\s+/g, '');
}

/**
 * Конвертирует китайские иероглифы в пиньин без тонов
 * Полезно для поиска по пиньину, когда пользователь вводит иероглифы
 * 
 * @param chineseText - текст с китайскими иероглифами
 * @returns пиньин без тонов
 */
export function chineseToPinyin(chineseText: string): string {
  try {
    // Используем pinyin-pro для конвертации
    const pinyinText = pinyin(chineseText, {
      toneType: 'none', // без тонов
      type: 'array', // массив для обработки
    });

    // Объединяем в строку и нормализуем
    return normalizePinyin(Array.isArray(pinyinText) ? pinyinText.join(' ') : pinyinText);
  } catch (error) {
    // Если конвертация не удалась, возвращаем оригинальный текст
    return chineseText;
  }
}

/**
 * Универсальная функция нормализации, автоматически определяет тип текста
 * 
 * @param text - текст для нормализации
 * @param type - тип текста (опционально, если не указан - определяется автоматически)
 * @returns нормализованный текст
 */
export function normalizeQuery(text: string, type?: 'chinese' | 'pinyin' | 'russian'): string {
  if (!text) {
    return '';
  }

  // Если тип не указан, пытаемся определить автоматически
  if (!type) {
    if (/[\u4e00-\u9fff]/.test(text)) {
      type = 'chinese';
    } else if (/[а-яА-ЯёЁ]/.test(text)) {
      type = 'russian';
    } else {
      type = 'pinyin';
    }
  }

  switch (type) {
    case 'chinese':
      return normalizeChinese(text);
    case 'pinyin':
      return normalizePinyin(text);
    case 'russian':
      return normalizeRussian(text);
    default:
      return text.trim();
  }
}

/**
 * Удаляет специальные символы, оставляя только буквы, цифры и пробелы
 * 
 * @param text - текст для очистки
 * @returns очищенный текст
 */
export function sanitizeQuery(text: string): string {
  return text
    .trim()
    // Удаляем специальные символы, кроме букв (любых скриптов), цифр и пробелов
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    // Нормализуем пробелы
    .replace(/\s+/g, ' ')
    .trim();
}

