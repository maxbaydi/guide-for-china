import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Definition } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
import { renderBKRSText } from '../../utils/bkrsParser';
import { parseDefinitions } from '../../utils/definitionParser';
import { ContextBadge } from '../ui/ContextBadge';
import { useTheme } from '../../contexts/ThemeContext';

interface DefinitionGroupProps {
  definitions: Definition[];
}

/**
 * Группирует определения по разделам (I гл., II сущ., III собств.) 
 * и отображает их с визуальной иерархией
 */
export const DefinitionGroup: React.FC<DefinitionGroupProps> = ({ definitions }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const sections = React.useMemo(() => {
    return parseDefinitions(definitions);
  }, [definitions]);

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {t('character.noDefinitions')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sections.map((section, sectionIndex) => (
        <View key={`section-${section.sectionNumber}-${sectionIndex}`}>
          {/* Заголовок раздела с синей полоской слева */}
          {/* Показываем только если есть часть речи ИЛИ пиньинь */}
          {section.sectionNumber && (section.partOfSpeech || section.pronunciation) && (
            <View 
              style={[
                styles.sectionHeader, 
                { borderLeftColor: theme.primary }
              ]}
            >
              <View style={styles.sectionHeaderContent}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {section.sectionNumber} {section.partOfSpeech}
                </Text>
                
                {/* Пиньинь раздела (если есть) */}
                {section.pronunciation && (
                  <View style={styles.sectionPronunciationContainer}>
                    <Text style={[styles.sectionPronunciation, { color: theme.primary }]}>
                      {section.pronunciation}
                    </Text>
                    {section.pronunciationVariants && section.pronunciationVariants.length > 1 && (
                      <Text style={[styles.sectionPronunciationVariants, { color: theme.textSecondary }]}>
                        {' '}(также: {section.pronunciationVariants.slice(1).join(', ')})
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Значения без подразделов */}
          {section.meanings.length > 0 && (
            <View style={styles.meaningsContainer}>
              {section.meanings.map((meaning, meaningIndex) => (
              <View 
                key={`meaning-${section.sectionNumber}-${meaning.number}-${meaningIndex}`}
                style={styles.meaningItem}
              >
                {/* Номер значения (если есть) */}
                {meaning.number && (
                  <View style={styles.meaningNumberContainer}>
                    <Text style={[styles.meaningNumber, { color: theme.text }]}>
                      {meaning.number}.
                    </Text>
                  </View>
                )}

                {/* Содержание значения */}
                <View style={[styles.meaningContent, !meaning.number && styles.meaningContentFull]}>
                  {/* Пиньинь, если отличается от основного */}
                  {meaning.pronunciation && (
                    <Text style={[styles.pronunciation, { color: theme.textSecondary }]}>
                      {meaning.pronunciation}
                    </Text>
                  )}

                  {/* Основной перевод */}
                  <Text style={[styles.translation, { color: theme.text }]}>
                    {renderBKRSText(meaning.translation, { fontSize: 16 })}
                  </Text>

                  {/* Контекстные бейджи */}
                  {meaning.contextBadges.length > 0 && (
                    <View style={styles.badgesContainer}>
                      {meaning.contextBadges.map((badge, badgeIndex) => (
                        <ContextBadge 
                          key={`badge-${meaningIndex}-${badgeIndex}`}
                          label={badge}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
          )}

          {/* Подразделы (А, Б, В) */}
          {section.subsections.map((subsection, subsectionIndex) => (
            <View key={`subsection-${section.sectionNumber}-${subsection.label}-${subsectionIndex}`}>
              {/* Заголовок подраздела */}
              <View style={[styles.subsectionHeader, { backgroundColor: theme.surfaceHover }]}>
                <Text style={[styles.subsectionLabel, { color: theme.primary }]}>
                  {subsection.label}
                </Text>
              </View>

              {/* Значения в подразделе */}
              <View style={styles.meaningsContainer}>
                {subsection.meanings.map((meaning, meaningIndex) => (
                  <View 
                    key={`sub-meaning-${subsection.label}-${meaning.number}-${meaningIndex}`}
                    style={styles.meaningItem}
                  >
                    {/* Номер значения (если есть) */}
                    {meaning.number && (
                      <View style={styles.meaningNumberContainer}>
                        <Text style={[styles.meaningNumber, { color: theme.text }]}>
                          {meaning.number}.
                        </Text>
                      </View>
                    )}

                    {/* Содержание значения */}
                    <View style={[styles.meaningContent, !meaning.number && styles.meaningContentFull]}>
                      {/* Пиньинь, если отличается от основного */}
                      {meaning.pronunciation && (
                        <Text style={[styles.pronunciation, { color: theme.textSecondary }]}>
                          {meaning.pronunciation}
                        </Text>
                      )}

                      {/* Основной перевод */}
                      <Text style={[styles.translation, { color: theme.text }]}>
                        {renderBKRSText(meaning.translation, { fontSize: 16 })}
                      </Text>

                      {/* Контекстные бейджи */}
                      {meaning.contextBadges.length > 0 && (
                        <View style={styles.badgesContainer}>
                          {meaning.contextBadges.map((badge, badgeIndex) => (
                            <ContextBadge 
                              key={`sub-badge-${meaningIndex}-${badgeIndex}`}
                              label={badge}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Разделитель между разделами */}
          {sectionIndex < sections.length - 1 && (
            <Divider style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  sectionHeaderContent: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionPronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sectionPronunciation: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  sectionPronunciationVariants: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  subsectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  subsectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  meaningsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  meaningItem: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  meaningNumberContainer: {
    width: 28,
    paddingTop: 2,
  },
  meaningNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  meaningContent: {
    flex: 1,
    gap: 6,
  },
  meaningContentFull: {
    marginLeft: 0,
  },
  pronunciation: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 20,
  },
});
