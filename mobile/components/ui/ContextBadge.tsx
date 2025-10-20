import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ContextBadgeProps {
  label: string;
}

/**
 * Компонент для отображения контекстных помет (знаниями, кому-л., анат., перен. и т.д.)
 */
export const ContextBadge: React.FC<ContextBadgeProps> = ({ label }) => {
  if (!label || label.trim() === '') return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

