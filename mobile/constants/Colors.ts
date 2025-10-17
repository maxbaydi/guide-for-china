/**
 * Цветовая палитра HanGuide
 * Расширенная палитра с поддержкой темной темы
 * Основана на cyan/голубой + оранжевый акцентах
 */

// Светлая тема
export const LightColors = {
  // Основные цвета - более насыщенные
  primary: '#0891b2',        // cyan-600 - основной акцент (было cyan-500)
  primaryDark: '#0e7490',    // cyan-700 - для активных состояний
  primaryLight: '#06b6d4',   // cyan-500 - для hover и светлых вариантов
  primaryLighter: '#22d3ee', // cyan-400 - для градиентов
  primaryPale: '#ecfeff',    // cyan-50 - для фонов
  
  secondary: '#f97316',      // orange-500 - вторичный акцент
  secondaryDark: '#ea580c',  // orange-600 - активное состояние
  secondaryLight: '#fb923c', // orange-400 - светлый вариант
  secondaryPale: '#fff7ed',  // orange-50 - для фонов
  
  // Градиентные цвета
  blue: '#2563eb',           // blue-600 - для градиентов
  blueLight: '#3b82f6',      // blue-500
  purple: '#7c3aed',         // violet-600 - дополнительный акцент
  
  // Фоны
  background: '#f9fafb',     // gray-50 - основной фон
  backgroundElevated: '#ffffff', // white - поднятые элементы
  surface: '#ffffff',        // white - поверхности (карточки)
  surfaceHover: '#f3f4f6',   // gray-100 - hover состояние
  
  // Текст
  text: '#111827',           // gray-900 - основной текст (более темный)
  textSecondary: '#6b7280',  // gray-500 - второстепенный текст
  textTertiary: '#9ca3af',   // gray-400 - третичный текст
  textInverse: '#ffffff',    // white - текст на темном фоне
  
  // Состояния
  success: '#10b981',        // green-500
  successLight: '#d1fae5',   // green-100
  error: '#ef4444',          // red-500
  errorLight: '#fee2e2',     // red-100
  warning: '#f59e0b',        // amber-500
  warningLight: '#fef3c7',   // amber-100
  info: '#3b82f6',           // blue-500
  infoLight: '#dbeafe',      // blue-100
  
  // Границы
  border: '#e5e7eb',         // gray-200
  borderLight: '#f3f4f6',    // gray-100
  borderDark: '#d1d5db',     // gray-300
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Тени
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowLarge: 'rgba(0, 0, 0, 0.2)',
};

// Темная тема
export const DarkColors = {
  // Основные цвета - адаптированные для темной темы
  primary: '#22d3ee',        // cyan-400 - более яркий для темной темы
  primaryDark: '#06b6d4',    // cyan-500 - для активных состояний
  primaryLight: '#67e8f9',   // cyan-300 - для hover
  primaryLighter: '#a5f3fc', // cyan-200 - для градиентов
  primaryPale: '#164e63',    // cyan-900 - для фонов
  
  secondary: '#fb923c',      // orange-400 - более яркий
  secondaryDark: '#f97316',  // orange-500 - активное состояние
  secondaryLight: '#fdba74', // orange-300 - светлый вариант
  secondaryPale: '#7c2d12',  // orange-900 - для фонов
  
  // Градиентные цвета
  blue: '#60a5fa',           // blue-400 - для градиентов
  blueLight: '#93c5fd',      // blue-300
  purple: '#a78bfa',         // violet-400 - дополнительный акцент
  
  // Фоны
  background: '#0f172a',     // slate-900 - основной фон
  backgroundElevated: '#1e293b', // slate-800 - поднятые элементы
  surface: '#1e293b',        // slate-800 - поверхности (карточки)
  surfaceHover: '#334155',   // slate-700 - hover состояние
  
  // Текст
  text: '#f8fafc',           // slate-50 - основной текст
  textSecondary: '#cbd5e1',  // slate-300 - второстепенный текст
  textTertiary: '#94a3b8',   // slate-400 - третичный текст
  textInverse: '#0f172a',    // slate-900 - текст на светлом фоне
  
  // Состояния
  success: '#34d399',        // green-400
  successLight: '#064e3b',   // green-900
  error: '#f87171',          // red-400
  errorLight: '#7f1d1d',     // red-900
  warning: '#fbbf24',        // amber-400
  warningLight: '#78350f',   // amber-900
  info: '#60a5fa',           // blue-400
  infoLight: '#1e3a8a',      // blue-900
  
  // Границы
  border: '#334155',         // slate-700
  borderLight: '#475569',    // slate-600
  borderDark: '#1e293b',     // slate-800
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Тени - адаптированные для темной темы
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowLarge: 'rgba(0, 0, 0, 0.5)',
};

// Экспорт Colors для обратной совместимости (по умолчанию светлая тема)
export const Colors = LightColors;

/**
 * Цветовая схема для деталей иероглифа
 * Основана на примере BKRS
 */
export const CharacterColors = {
  light: {
    highlight: '#10b981',      // Зеленый - выделение иероглифа в примерах
    pinyin: '#6b7280',         // Серый - пиньинь
    partOfSpeech: '#f59e0b',   // Оранжевый - части речи (сущ., глагол)
    context: '#8b5cf6',        // Фиолетовый - контекстные пометки (устар., перен.)
    secondary: '#64748b',      // Серый - вторичная информация
    label: '#dc2626',          // Красный - метки и пометки
  },
  dark: {
    highlight: '#34d399',      // Зеленый - более яркий для темной темы
    pinyin: '#cbd5e1',         // Светлый серый - пиньинь
    partOfSpeech: '#fbbf24',   // Яркий оранжевый - части речи
    context: '#a78bfa',        // Светлый фиолетовый - контекстные пометки
    secondary: '#94a3b8',      // Светлый серый - вторичная информация
    label: '#f87171',          // Светлый красный - метки и пометки
  },
};

// Система spacing (в пикселях)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Система border radius (в пикселях)
export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Система теней
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
};

// Темные тени (для темной темы)
export const DarkShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
};

