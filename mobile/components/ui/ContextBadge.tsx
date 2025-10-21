import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';

interface ContextBadgeProps {
  label: string;
}

/**
 * Компонент для отображения контекстных помет (знаниями, кому-л., анат., перен. и т.д.)
 */
export const ContextBadge: React.FC<ContextBadgeProps> = ({ label }) => {
  const { theme } = useTheme();
  
  if (!label || label.trim() === '') return null;

  return (
    <View style={[styles.badge, { backgroundColor: theme.surfaceHover }]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
});

