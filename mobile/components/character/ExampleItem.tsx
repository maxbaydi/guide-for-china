import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Example } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';

interface ExampleItemProps {
  example: Example;
  highlightCharacter?: string;
}

/**
 * Компонент для отображения примера использования иероглифа
 * с подсветкой искомого иероглифа
 */
export const ExampleItem: React.FC<ExampleItemProps> = ({ 
  example, 
  highlightCharacter 
}) => {
  const { theme } = useTheme();

  // Функция для подсветки иероглифа в тексте
  const renderHighlightedText = (text: string, highlight?: string) => {
    if (!highlight || !text.includes(highlight)) {
      return <Text style={[styles.chinese, { color: theme.text }]}>{text}</Text>;
    }

    const parts = text.split(highlight);
    return (
      <Text style={[styles.chinese, { color: theme.text }]}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <Text style={[styles.highlighted, { color: theme.primary }]}>
                {highlight}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Китайский текст с подсветкой */}
      {renderHighlightedText(example.chinese, highlightCharacter)}

      {/* Пиньинь */}
      {example.pinyin && (
        <Text style={[styles.pinyin, { color: theme.textSecondary }]}>
          {example.pinyin}
        </Text>
      )}

      {/* Русский перевод */}
      <Text style={[styles.russian, { color: theme.text }]}>
        {example.russian}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    gap: 6,
  },
  chinese: {
    fontFamily: 'Noto Serif SC',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  highlighted: {
    fontWeight: '700',
  },
  pinyin: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  russian: {
    fontSize: 16,
    lineHeight: 24,
  },
});
