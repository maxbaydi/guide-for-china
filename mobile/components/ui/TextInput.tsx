import React, { useState } from 'react';
import { TextInput as RNTextInput, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/Colors';

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  onSubmitEditing?: () => void;
  onBlur?: (...args: any[]) => void;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  style?: any;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  secureTextEntry = false,
  error = false,
  errorMessage,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onSubmitEditing,
  onBlur,
  maxLength,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  style,
}) => {
  const { theme, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderWidth.value = withTiming(2, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, { duration: 200 });
    if (onBlur) {
      onBlur();
    }
  };

  const getBorderColor = () => {
    if (error) return theme.error;
    if (isFocused) return theme.primary;
    return theme.border;
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>
          {label}
        </Text>
      )}
      <AnimatedView
        style={[
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            backgroundColor: theme.surface,
            borderRadius: BorderRadius.lg,
            borderColor: getBorderColor(),
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            ...shadows.small,
          },
          animatedStyle,
          !editable && { opacity: 0.6 },
          style,
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={error ? theme.error : theme.textSecondary}
            style={[styles.leftIcon, multiline && { marginTop: 2 }]}
          />
        )}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { color: theme.text },
            multiline && styles.inputMultiline,
          ]}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={editable}
          returnKeyType={multiline ? 'default' : 'done'}
        />
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={20}
              color={error ? theme.error : theme.textSecondary}
              style={[styles.rightIcon, multiline && { marginTop: 2 }]}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>
      {error && errorMessage && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
