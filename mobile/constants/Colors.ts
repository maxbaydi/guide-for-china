/**
 * Цветовая палитра HanGuide
 * Основана на дизайне из templatefront.html
 */

export const Colors = {
  // Основные цвета
  primary: '#E53935',        // Vibrant Red (кнопки, акценты)
  secondary: '#1DB954',      // Jade Green (прогресс, HSK)
  
  // Фоны
  background: '#F7F7F7',     // Off-white (основной фон)
  backgroundLight: '#E5E7EB', // Серый для карточек
  white: '#FFFFFF',
  
  // Текст
  text: '#2D2D2D',           // Dark Charcoal (основной текст)
  textLight: '#6B7280',      // Светло-серый (второстепенный текст)
  textDark: '#1F2937',       // Темный текст
  
  // Состояния
  success: '#1DB954',
  error: '#E53935',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Границы
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
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

