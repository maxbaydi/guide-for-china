import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing } from '../../constants/Colors';
import { Character } from '../../types/api.types';

interface CharacterCardProps {
  character: Character;
  onPress?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
}) => {
  const { theme } = useTheme();
  
  return (
    <Card onPress={onPress} variant="elevated">
      <View style={styles.container}>
        <Text style={[styles.character, { color: theme.text }]}>
          {character.simplified}
        </Text>
        {character.pinyin && (
          <Text style={[styles.pinyin, { color: theme.text }]} variant="bodyMedium">
            {character.pinyin}
          </Text>
        )}
        {character.definitions && character.definitions.length > 0 && (
          <Text
            style={[styles.translation, { color: theme.textSecondary }]}
            variant="bodyMedium"
            numberOfLines={2}
          >
            {character.definitions[0]?.translation || ''}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  character: {
    fontSize: 44,
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  pinyin: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  translation: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
