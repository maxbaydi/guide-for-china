import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

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

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outlined' ? Colors.text : Colors.white} />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyle}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12, // rounded-lg
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  primary: {
    backgroundColor: Colors.secondary, // orange-500
  },
  secondary: {
    backgroundColor: Colors.primary, // cyan-500
    paddingVertical: 8,
  },
  outlined: {
    backgroundColor: Colors.white, // белый фон для лучшего контраста
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dashed: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray, // gray-300
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  outlinedText: {
    color: Colors.text, // gray-800
  },
  dashedText: {
    color: Colors.textLight, // gray-500
  },
  disabledText: {
    opacity: 0.7,
  },
});

