import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/Colors';

interface ChipProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Chip: React.FC<ChipProps> = ({
  children,
  onPress,
  selected = false,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        {
          backgroundColor: selected ? theme.primary : theme.borderLight,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          borderRadius: BorderRadius.full,
        },
        animatedStyle,
      ]}
    >
      <Text style={[
        styles.text,
        { color: selected ? theme.textInverse : theme.text }
      ]}>
        {children}
      </Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
