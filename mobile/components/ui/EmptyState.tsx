import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  description,
  action,
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={Colors.textLight} />
      <View style={styles.textContainer}>
        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>
        {description && (
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
    gap: 24,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    color: Colors.textLight,
    textAlign: 'center',
    maxWidth: 300,
  },
  action: {
    marginTop: 8,
  },
});
