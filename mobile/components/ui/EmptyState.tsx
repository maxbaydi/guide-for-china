import React, { useEffect } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing } from '../../constants/Colors';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);
const AnimatedView = Animated.createAnimatedComponent(View);

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  description,
  action,
}) => {
  const { theme } = useTheme();
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Bounce анимация иконки
    iconScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1.1, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    // Fade-in анимация текста
    textOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <AnimatedIcon 
        name={icon} 
        size={72} 
        color={theme.textSecondary} 
        style={iconAnimatedStyle}
      />
      <AnimatedView style={[styles.textContainer, textAnimatedStyle]}>
        <Text variant="titleLarge" style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {description && (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.textSecondary }]}>
            {description}
          </Text>
        )}
      </AnimatedView>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl + 16,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  action: {
    marginTop: Spacing.sm,
  },
});
