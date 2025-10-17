import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Definition } from '../../types/api.types';
import { Colors, CharacterColors } from '../../constants/Colors';
import { renderBKRSText } from '../../utils/bkrsParser';

interface DefinitionGroupProps {
  definitions: Definition[];
}

/**
 * Группирует определения по частям речи и отображает их
 * с цветовым кодированием
 */
export const DefinitionGroup: React.FC<DefinitionGroupProps> = ({ definitions }) => {
  const { t } = useTranslation();
  
  // Группируем определения по partOfSpeech
  const grouped = React.useMemo(() => {
    const groups: { [key: string]: Definition[] } = {};
    
    definitions.forEach((def) => {
      const key = def.partOfSpeech || t('character.generalDef');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(def);
    });
    
    return groups;
  }, [definitions, t]);

  const groupKeys = Object.keys(grouped);

  return (
    <View style={styles.container}>
      {groupKeys.map((partOfSpeech, groupIndex) => (
        <View key={partOfSpeech}>
          {/* Заголовок группы (часть речи) */}
          {partOfSpeech !== t('character.generalDef') && (
            <View style={styles.partOfSpeechContainer}>
              <Text style={styles.partOfSpeech}>{partOfSpeech}</Text>
            </View>
          )}

          {/* Определения в группе */}
          {grouped[partOfSpeech].map((def, defIndex) => (
            <View key={`${partOfSpeech}-${def.id}-${defIndex}`}>
              <View style={styles.definitionItem}>
                <View style={styles.definitionContent}>
                  {/* Контекстная пометка (если есть) */}
                  {def.context && (
                    <Text style={styles.context}>
                      {renderBKRSText(def.context, { fontSize: 14 })}
                    </Text>
                  )}
                  
                  {/* Основной перевод */}
                  <Text style={styles.translation}>
                    {renderBKRSText(def.translation, { fontSize: 16 })}
                  </Text>
                </View>
              </View>

              {/* Разделитель между определениями */}
              {defIndex < grouped[partOfSpeech].length - 1 && (
                <Divider style={styles.divider} />
              )}
            </View>
          ))}

          {/* Разделитель между группами */}
          {groupIndex < groupKeys.length - 1 && (
            <Divider style={styles.groupDivider} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  partOfSpeechContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 6,
    marginBottom: 8,
  },
  partOfSpeech: {
    fontSize: 14,
    fontWeight: '600',
    color: CharacterColors.partOfSpeech,
    textTransform: 'uppercase',
  },
  definitionItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  definitionContent: {
    gap: 4,
  },
  context: {
    fontSize: 14,
    color: CharacterColors.context,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  divider: {
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  groupDivider: {
    backgroundColor: Colors.border,
    marginVertical: 12,
    height: 2,
  },
});

