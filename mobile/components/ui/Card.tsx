import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/Colors';

type CardVariant = 'standard' | 'gradient' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: CardVariant;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({ 
  children, 
  onPress, 
  style,
  variant = 'standard',
}) => {
  const { theme, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  };

  const content = (
    <View style={[styles.content]}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const gradientCard = (
      <LinearGradient
        colors={[theme.primary, theme.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            ...shadows.large,
          },
          style
        ]}
      >
        {content}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <AnimatedTouchable 
          onPress={onPress} 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={animatedStyle}
        >
          {gradientCard}
        </AnimatedTouchable>
      );
    }
    return gradientCard;
  }

  // Standard or elevated card
  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: variant === 'standard' ? 1 : 0,
      borderColor: theme.border,
      ...(variant === 'elevated' ? shadows.medium : shadows.small),
    },
    style,
  ];

  const standardCard = (
    <View style={cardStyle}>
      {content}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedTouchable 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={animatedStyle}
      >
        {standardCard}
      </AnimatedTouchable>
    );
  }

  return standardCard;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.lg,
  },
});

