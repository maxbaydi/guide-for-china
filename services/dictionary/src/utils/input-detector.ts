/**
 * Утилита для детекции типа ввода пользователя
 * Определяет, вводит ли пользователь китайские иероглифы, пиньин или русский текст
 */

export enum InputType {
  CHINESE = 'chinese',
  PINYIN = 'pinyin',
  RUSSIAN = 'russian',
  MIXED = 'mixed',
}

/**
 * Определяет тип ввода на основе Unicode диапазонов символов
 * @param query - строка запроса для анализа
 * @returns InputType - тип определенного ввода
 */
export function detectInputType(query: string): InputType {
  if (!query || query.trim().length === 0) {
    return InputType.MIXED;
  }

  // Подсчет символов разных типов
  // Китайские иероглифы: основной блок + расширения CJK
  const chineseChars = query.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g)?.length || 0;
  
  // Латинские символы (включая ü для пиньина)
  const latinChars = query.match(/[a-zA-ZüÜ]/g)?.length || 0;
  
  // Кириллические символы
  const cyrillicChars = query.match(/[а-яА-ЯёЁ]/g)?.length || 0;

  // Общее количество значимых символов
  const totalChars = chineseChars + latinChars + cyrillicChars;

  // Если нет значимых символов (только пунктуация/цифры)
  if (totalChars === 0) {
    return InputType.MIXED;
  }

  // Подсчитываем количество различных типов символов
  const typesPresent = [
    chineseChars > 0,
    latinChars > 0,
    cyrillicChars > 0,
  ].filter(Boolean).length;

  // Если присутствует более одного типа символов - это смешанный ввод
  if (typesPresent > 1) {
    return InputType.MIXED;
  }

  // Определяем тип на основе единственного присутствующего типа
  if (chineseChars > 0) {
    return InputType.CHINESE;
  }

  if (latinChars > 0) {
    return InputType.PINYIN;
  }

  if (cyrillicChars > 0) {
    return InputType.RUSSIAN;
  }

  // Fallback (не должно произойти, но на всякий случай)
  return InputType.MIXED;
}

/**
 * Проверяет, содержит ли строка китайские иероглифы
 * @param text - текст для проверки
 * @returns boolean - true если содержит хотя бы один китайский иероглиф
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

/**
 * Проверяет, является ли строка валидным пиньином
 * @param text - текст для проверки
 * @returns boolean - true если строка похожа на пиньин
 */
export function isPinyin(text: string): boolean {
  // Пустая строка или только пробелы считается валидным (краевой случай)
  if (!text || text.trim().length === 0) {
    return true;
  }
  // Пиньин содержит только латинские буквы, возможно с тонами и ü
  // Включает:
  // - Базовые латинские: a-zA-Z
  // - Цифры тонов: 0-9
  // - Пробелы: \s
  // - ü и Ü
  // - Диакритические знаки (combining): \u0300-\u036f
  // - Символы пиньина с тонами (composed): āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜÜ
  return /^[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s0-9\u0300-\u036f]+$/.test(text);
}

/**
 * Проверяет, является ли строка русским текстом
 * @param text - текст для проверки
 * @returns boolean - true если строка содержит преимущественно кириллицу
 */
export function isRussian(text: string): boolean {
  const cyrillicChars = text.match(/[а-яА-ЯёЁ]/g)?.length || 0;
  const totalChars = text.replace(/\s/g, '').length;
  
  return totalChars > 0 && cyrillicChars / totalChars > 0.5;
}

