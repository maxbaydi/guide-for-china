import { withSpring, withTiming, withSequence } from 'react-native-reanimated';

/**
 * Конфигурации анимаций для консистентности
 */

// Spring configurations
export const SpringConfig = {
  gentle: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  },
  smooth: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  },
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.5,
  },
};

// Timing configurations
export const TimingConfig = {
  fast: {
    duration: 150,
  },
  normal: {
    duration: 250,
  },
  slow: {
    duration: 400,
  },
};

/**
 * Анимация масштабирования при нажатии
 * @param scale - целевой масштаб (по умолчанию 0.95)
 * @returns shared value для анимации
 */
export const scaleOnPress = (scale: number = 0.95) => {
  'worklet';
  return withSequence(
    withTiming(scale, { duration: 100 }),
    withSpring(1, SpringConfig.gentle)
  );
};

/**
 * Плавное появление с fade-in эффектом
 * @param duration - длительность анимации в мс
 */
export const fadeIn = (duration: number = 300) => {
  'worklet';
  return withTiming(1, { duration });
};

/**
 * Плавное исчезновение с fade-out эффектом
 * @param duration - длительность анимации в мс
 */
export const fadeOut = (duration: number = 300) => {
  'worklet';
  return withTiming(0, { duration });
};

/**
 * Slide-in анимация снизу
 * @param targetValue - конечная позиция (обычно 0)
 */
export const slideInFromBottom = (targetValue: number = 0) => {
  'worklet';
  return withSpring(targetValue, SpringConfig.smooth);
};

/**
 * Slide-out анимация вниз
 * @param targetValue - конечная позиция
 */
export const slideOutToBottom = (targetValue: number) => {
  'worklet';
  return withTiming(targetValue, TimingConfig.normal);
};

/**
 * Анимированное заполнение прогресс-бара
 * @param targetProgress - целевое значение прогресса (0-1)
 */
export const progressAnimation = (targetProgress: number) => {
  'worklet';
  return withSpring(targetProgress, {
    damping: 15,
    stiffness: 100,
    mass: 0.5,
  });
};

/**
 * Пульсирующая анимация (для прогресс-баров или индикаторов)
 */
export const pulse = () => {
  'worklet';
  return withSequence(
    withTiming(1.05, { duration: 600 }),
    withTiming(1, { duration: 600 })
  );
};

/**
 * Shake анимация (для ошибок или привлечения внимания)
 */
export const shake = () => {
  'worklet';
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};

/**
 * Rotate анимация для loader'ов
 */
export const rotate = () => {
  'worklet';
  return withTiming(360, { duration: 1000 });
};

/**
 * Bounce анимация при появлении
 */
export const bounceIn = () => {
  'worklet';
  return withSequence(
    withTiming(1.1, { duration: 150 }),
    withSpring(1, SpringConfig.bouncy)
  );
};

