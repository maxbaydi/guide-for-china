import React, { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/Colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
}) => {
  const { t } = useTranslation();
  const { theme, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const iconScale = useSharedValue(1);
  const borderWidth = useSharedValue(1);
  
  const placeholderText = placeholder || t('search.searchPlaceholder');

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    iconScale.value = withSpring(1.15, { damping: 15, stiffness: 300 });
    borderWidth.value = withTiming(2);
  };

  const handleBlur = () => {
    setIsFocused(false);
    iconScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    borderWidth.value = withTiming(1);
  };

  return (
    <AnimatedView
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          borderRadius: BorderRadius.lg,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? theme.primary : theme.border,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md + 2,
          ...shadows.small,
        },
      ]}
    >
      <AnimatedIcon
        name="magnify"
        size={22}
        color={isFocused ? theme.primary : theme.textSecondary}
        style={[styles.icon, iconAnimatedStyle]}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholderText}
        placeholderTextColor={theme.textSecondary}
        onSubmitEditing={onSubmitEditing}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          { color: theme.text }
        ]}
        returnKeyType="search"
      />
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
