import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing } from '../../constants/Colors';
import { Character } from '../../types/api.types';
import { getFirstTranslation, isShortWord } from '../../utils/definitionParser';

interface CharacterCardProps {
  character: Character;
  onPress?: () => void;
  accentColor?: string;
}

/**
 * Карточка иероглифа с автоматическим выбором типа отображения:
 * - Компактный (горизонтальный) для отдельных иероглифов/слов (≤4 символа)
 * - Полный (вертикальный) для длинных фраз и предложений (>4 символов)
 */
export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
  accentColor,
}) => {
  const { theme } = useTheme();
  
  // Определяем тип отображения по длине текста
  const isCompact = isShortWord(character.simplified);
  
  // Получаем первый реальный перевод (не заголовок раздела)
  const translation = getFirstTranslation(character.definitions || []);

  if (isCompact) {
    // Компактная карточка (как слово дня) для отдельных иероглифов
    return (
      <Card 
        onPress={onPress} 
        variant="elevated"
        accentColor={accentColor}
      >
        <View style={styles.compactContainer}>
          {/* Левая колонка: иероглиф и пиньинь */}
          <View style={styles.compactCharColumn}>
            <Text style={[styles.compactCharacter, { color: theme.text }]}>
              {character.simplified}
            </Text>
            {character.pinyin && (
              <Text 
                style={[styles.compactPinyin, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {character.pinyin}
              </Text>
            )}
          </View>

          {/* Правая колонка: перевод */}
          <View style={styles.compactTextColumn}>
            {translation && (
              <Text
                style={[styles.compactTranslation, { color: theme.text }]}
                numberOfLines={2}
              >
                {translation}
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  }

  // Полная карточка (вертикальная) для длинных фраз
  return (
    <Card 
      onPress={onPress} 
      variant="elevated"
      accentColor={accentColor}
    >
      <View style={styles.fullContainer}>
        <Text 
          style={[styles.fullCharacter, { color: theme.text }]}
          numberOfLines={2}
        >
          {character.simplified}
        </Text>
        {character.pinyin && (
          <Text 
            style={[styles.fullPinyin, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {character.pinyin}
          </Text>
        )}
        {translation && (
          <Text
            style={[styles.fullTranslation, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {translation}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Компактный стиль (горизонтальный, как слово дня)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: 0,
  },
  compactCharColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    gap: Spacing.xs,
  },
  compactCharacter: {
    fontFamily: 'Noto Serif SC',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 1,
  },
  compactPinyin: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  compactTextColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  compactTranslation: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 22,
  },

  // Полный стиль (вертикальный, для фраз)
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  fullCharacter: {
    fontFamily: 'Noto Serif SC',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 32,
  },
  fullPinyin: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  fullTranslation: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
