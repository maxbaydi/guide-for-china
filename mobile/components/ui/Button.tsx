import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface CustomButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  icon?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={[styles.button, style]}
      labelStyle={styles.label}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

