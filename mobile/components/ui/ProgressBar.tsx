import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius } from '../../constants/Colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  variant?: 'gradient' | 'solid' | 'warning';
  style?: ViewStyle;
  height?: number;
  animated?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedView = Animated.createAnimatedComponent(View);

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'gradient',
  style,
  height = 10,
  animated = true,
}) => {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  const animatedWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      animatedWidth.value = withSpring(clampedProgress, {
        damping: 15,
        stiffness: 100,
        mass: 0.5,
      });

      // Пульсация только если прогресс больше 0 и меньше 1
      if (clampedProgress > 0 && clampedProgress < 1) {
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          false
        );
      } else {
        pulseScale.value = 1;
      }
    } else {
      animatedWidth.value = clampedProgress;
    }
  }, [clampedProgress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
    transform: [{ scaleY: pulseScale.value }],
  }));

  const getBarColor = () => {
    if (variant === 'warning') return theme.secondary;
    if (variant === 'solid') return theme.primary;
    return null; // gradient will be used
  };

  const barColor = getBarColor();

  return (
    <View style={[
      styles.container, 
      { 
        height, 
        backgroundColor: theme.border,
        borderRadius: BorderRadius.xs,
      }, 
      style
    ]}>
      {variant === 'gradient' ? (
        <AnimatedLinearGradient
          colors={[theme.primary, theme.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.bar,
            {
              height,
              borderRadius: BorderRadius.xs,
            },
            animatedStyle,
          ]}
        />
      ) : (
        <AnimatedView
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              height,
              borderRadius: BorderRadius.xs,
            },
            animatedStyle,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

