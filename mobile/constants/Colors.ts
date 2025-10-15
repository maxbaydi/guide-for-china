/**
 * Цветовая палитра HanGuide
 * Основана на дизайне из style.md - cyan/голубой + оранжевый
 */

export const Colors = {
  // Основные цвета (cyan-500, orange-500)
  primary: '#06b6d4',        // cyan-500 - основной акцент
  primaryDark: '#0891b2',    // cyan-600 - для активных состояний
  primaryLight: '#22d3ee',   // cyan-400 - для градиентов
  secondary: '#f97316',      // orange-500 - вторичный акцент
  secondaryDark: '#ea580c',  // orange-600 - активное состояние
  
  // Фоны
  background: '#f9fafb',     // gray-50 - основной фон
  backgroundLight: '#e0f2fe', // cyan-50 - для вспомогательных элементов
  white: '#ffffff',
  
  // Текст
  text: '#1f2937',           // gray-800 - основной текст
  textLight: '#6b7280',      // gray-500 - второстепенный текст
  textDark: '#111827',       // gray-900 - темный текст
  
  // Состояния
  success: '#10b981',        // green-500
  error: '#ef4444',          // red-500
  warning: '#f59e0b',        // amber-500
  info: '#3b82f6',           // blue-500
  
  // Границы
  border: '#e5e7eb',         // gray-200
  borderLight: '#f3f4f6',    // gray-100
  
  // Дополнительные цвета
  blue: '#2563eb',           // blue-600 - для градиентов
  cyanLight: '#bae6fd',      // cyan-200 - для активных состояний
  gray: '#d1d5db',           // gray-300
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

/**
 * Цветовая схема для деталей иероглифа
 * Основана на примере BKRS
 */
export const CharacterColors = {
  highlight: '#10b981',      // Зеленый - выделение иероглифа в примерах
  pinyin: '#6b7280',         // Серый - пиньинь
  partOfSpeech: '#f59e0b',   // Оранжевый - части речи (сущ., глагол)
  context: '#8b5cf6',        // Фиолетовый - контекстные пометки (устар., перен.)
  secondary: '#64748b',      // Серый - вторичная информация
  label: '#dc2626',          // Красный - метки и пометки
};

export const ColorTokens = {
  light: {
    background: Colors.background,
    card: Colors.white,
    text: Colors.text,
    textSecondary: Colors.textLight,
    border: Colors.border,
    primary: Colors.primary,
    secondary: Colors.secondary,
  },
  dark: {
    // Будущая темная тема
    background: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    primary: Colors.primary,
    secondary: Colors.secondary,
  },
};

