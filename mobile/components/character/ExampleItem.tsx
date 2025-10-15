import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Example } from '../../types/api.types';
import { Colors, CharacterColors } from '../../constants/Colors';

interface ExampleItemProps {
  example: Example;
  highlightCharacter?: string; // Иероглиф для выделения
}

/**
 * Отображает пример использования иероглифа
 * с выделением искомого символа зеленым цветом
 */
export const ExampleItem: React.FC<ExampleItemProps> = ({ 
  example, 
  highlightCharacter 
}) => {
  /**
   * Разбивает китайский текст на сегменты с выделением
   */
  const renderHighlightedText = (text: string, highlight?: string) => {
    if (!highlight) {
      return <Text style={styles.chinese}>{text}</Text>;
    }

    const segments: { text: string; highlighted: boolean }[] = [];
    let currentText = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Проверяем совпадение с выделяемым символом
      if (highlight && text.substr(i, highlight.length) === highlight) {
        // Сохраняем накопленный текст
        if (currentText) {
          segments.push({ text: currentText, highlighted: false });
          currentText = '';
        }
        // Добавляем выделенный символ
        segments.push({ text: highlight, highlighted: true });
        i += highlight.length - 1;
      } else {
        currentText += char;
      }
    }
    
    // Добавляем оставшийся текст
    if (currentText) {
      segments.push({ text: currentText, highlighted: false });
    }

    return (
      <Text style={styles.chinese}>
        {segments.map((segment, index) => (
          <Text
            key={index}
            style={segment.highlighted ? styles.highlighted : undefined}
          >
            {segment.text}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Китайский текст с выделением */}
      {renderHighlightedText(example.chinese, highlightCharacter)}
      
      {/* Пиньинь (если есть) */}
      {example.pinyin && (
        <Text style={styles.pinyin}>{example.pinyin}</Text>
      )}
      
      {/* Русский перевод */}
      <Text style={styles.russian}>{example.russian}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 6,
  },
  chinese: {
    fontFamily: 'Noto Serif SC',
    fontSize: 18,
    color: Colors.text,
    lineHeight: 26,
  },
  highlighted: {
    color: CharacterColors.highlight,
    fontWeight: '600',
  },
  pinyin: {
    fontSize: 14,
    color: CharacterColors.pinyin,
    lineHeight: 20,
  },
  russian: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginTop: 2,
  },
});

