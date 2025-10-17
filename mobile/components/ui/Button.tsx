import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'dashed';

interface CustomButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const { theme, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.secondary,
          ...shadows.medium,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.primary,
          paddingVertical: Spacing.md,
          ...shadows.small,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderWidth: 1.5,
          borderColor: theme.border,
        };
      case 'dashed':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: theme.borderDark,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return { ...baseTextStyle, color: theme.textInverse };
      case 'outlined':
        return { ...baseTextStyle, color: theme.text };
      case 'dashed':
        return { ...baseTextStyle, color: theme.textSecondary };
      default:
        return baseTextStyle;
    }
  };

  const buttonStyle = [
    getButtonStyle(),
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    getTextStyle(),
    disabled && styles.disabledText,
  ];

  const spinnerColor = variant === 'outlined' || variant === 'dashed' 
    ? theme.text 
    : theme.textInverse;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[buttonStyle, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyle}>{children}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

