import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, IconButton, Card, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { api } from '../../services/api';
import { Character, SimilarWord, ReverseTranslation } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { DefinitionGroup } from '../../components/character/DefinitionGroup';
import { ExampleItem } from '../../components/character/ExampleItem';

export default function CharacterDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'definitions' | 'examples' | 'similar' | 'reverse'>('definitions');
  const [modalVisible, setModalVisible] = useState(false);

  // Основные данные иероглифа
  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', id],
    queryFn: async () => {
      const { data } = await api.get(`/dictionary/character/${id}`, {
        skipErrorToast: true,
      } as any);
      return data;
    },
    enabled: !!id,
  });

  // Похожие слова - загружаются только при открытии вкладки
  const { data: similarWords } = useQuery<SimilarWord[]>({
    queryKey: ['similar-words', character?.simplified],
    queryFn: async () => {
      const { data } = await api.get(`/dictionary/character/${id}/similar`, {
        skipErrorToast: true,
      } as any);
      return data;
    },
    enabled: !!character?.simplified && activeTab === 'similar',
  });

  // Обратные переводы - загружаются только при открытии вкладки
  const { data: reverseTranslations } = useQuery<ReverseTranslation[]>({
    queryKey: ['reverse-translations', character?.simplified],
    queryFn: async () => {
      const { data } = await api.get(`/dictionary/character/${id}/reverse`, {
        skipErrorToast: true,
      } as any);
      return data;
    },
    enabled: !!character?.simplified && activeTab === 'reverse',
  });

  const handleAddSuccess = (collectionName: string) => {
    // Toast уже показан в AddToCollectionModal
  };

  const HeaderRight = () => (
    <IconButton
      icon="bookmark-plus-outline"
      iconColor={Colors.textLight}
      onPress={() => setModalVisible(true)}
    />
  );
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <EmptyState
          icon="text-box-search-outline"
          title={t('search.noResults')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: t('character.details'),
          headerShown: true,
          headerRight: () => <HeaderRight />,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.characterCard}>
          <Card.Content style={styles.characterCardContent}>
            <Text style={styles.character}>{character.simplified}</Text>
            <View style={styles.pinyinRow}>
              <Text style={styles.pinyin}>{character.pinyin}</Text>
              <IconButton
                icon="volume-high"
                size={24}
                iconColor={Colors.textLight}
                onPress={() => console.log('Play audio')}
              />
            </View>
          </Card.Content>
        </Card>

        {(character.hskLevel || character.frequency) && (
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsRow}>
              {character.hskLevel && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>HSK</Text>
                  <Text style={[styles.statValue, { color: Colors.secondary }]}>
                    {character.hskLevel}
                  </Text>
                </View>
              )}
              {character.frequency && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('character.frequency')}</Text>
                  <Text style={styles.statValue}>{character.frequency}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
        
        <View>
          <View style={styles.tabContainer}>
            <Button
              mode="text"
              onPress={() => setActiveTab('definitions')}
              labelStyle={[styles.tabButton, activeTab === 'definitions' && styles.activeTabText]}
              style={[styles.tab, activeTab === 'definitions' && styles.activeTab]}
            >
              {t('character.definitions')}
            </Button>
            <Button
              mode="text"
              onPress={() => setActiveTab('examples')}
              labelStyle={[styles.tabButton, activeTab === 'examples' && styles.activeTabText]}
              style={[styles.tab, activeTab === 'examples' && styles.activeTab]}
            >
              {t('character.examples')}
            </Button>
            <Button
              mode="text"
              onPress={() => setActiveTab('similar')}
              labelStyle={[styles.tabButton, activeTab === 'similar' && styles.activeTabText]}
              style={[styles.tab, activeTab === 'similar' && styles.activeTab]}
            >
              {t('character.similarWords')}
            </Button>
            <Button
              mode="text"
              onPress={() => setActiveTab('reverse')}
              labelStyle={[styles.tabButton, activeTab === 'reverse' && styles.activeTabText]}
              style={[styles.tab, activeTab === 'reverse' && styles.activeTab]}
            >
              {t('character.reverseTranslations')}
            </Button>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'definitions' && (
              <View style={styles.definitionsList}>
                <DefinitionGroup definitions={character.definitions} />
              </View>
            )}
            
            {activeTab === 'examples' && (
              <View style={styles.examplesList}>
                {character.examples && character.examples.length > 0 ? (
                  character.examples.map((ex, idx) => (
                    <View key={`${ex.id}-${idx}`}>
                      <ExampleItem 
                        example={ex} 
                        highlightCharacter={character.simplified}
                      />
                      {idx < (character.examples?.length ?? 0) - 1 && (
                        <Divider style={styles.divider} />
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noExamplesText}>{t('character.noExamples')}</Text>
                )}
              </View>
            )}

            {activeTab === 'similar' && (
              <View style={styles.similarList}>
                {similarWords && similarWords.length > 0 ? (
                  similarWords.map((word, idx) => (
                    <View key={`${word.id}-${idx}`}>
                      <Card 
                        style={styles.similarCard}
                        onPress={() => router.push(`/character/${word.id}`)}
                      >
                        <Card.Content style={styles.similarContent}>
                          <View style={styles.similarLeft}>
                            <Text style={styles.similarChinese}>{word.simplified}</Text>
                            <Text style={styles.similarPinyin}>{word.pinyin}</Text>
                          </View>
                          <Text style={styles.similarTranslation} numberOfLines={2}>
                            {word.mainTranslation}
                          </Text>
                        </Card.Content>
                      </Card>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noExamplesText}>{t('character.noSimilarWords')}</Text>
                )}
              </View>
            )}

            {activeTab === 'reverse' && (
              <View style={styles.reverseList}>
                {reverseTranslations && reverseTranslations.length > 0 ? (
                  reverseTranslations.map((trans, idx) => (
                    <View key={`reverse-${idx}`}>
                      <View style={styles.reverseItem}>
                        <Text style={styles.reverseRussian}>{trans.russian}</Text>
                        <Text style={styles.reverseChinese}>{trans.chinese}</Text>
                        {trans.pinyin && (
                          <Text style={styles.reversePinyin}>{trans.pinyin}</Text>
                        )}
                      </View>
                      {idx < reverseTranslations.length - 1 && (
                        <Divider style={styles.divider} />
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noExamplesText}>{t('character.noReverseTranslations')}</Text>
                )}
              </View>
            )}
          </View>
        </View>
        
      </ScrollView>
      
      {id && (
        <AddToCollectionModal
          visible={modalVisible}
          characterId={id}
          onDismiss={() => setModalVisible(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  characterCard: {
    backgroundColor: Colors.white,
  },
  characterCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  character: {
    fontFamily: 'Noto Serif SC',
    fontSize: 80,
    color: Colors.primary,
  },
  pinyinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pinyin: {
    fontSize: 24,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: Colors.textLight,
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    borderRadius: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabButton: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabContent: {
    paddingTop: 16,
  },
  definitionsList: {
    gap: 0,
  },
  divider: {
    backgroundColor: Colors.border,
  },
  examplesList: {
    gap: 0,
  },
  noExamplesText: {
    color: Colors.textLight,
    textAlign: 'center',
    padding: 16,
  },
  similarList: {
    gap: 12,
  },
  similarCard: {
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  similarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  similarLeft: {
    gap: 4,
  },
  similarChinese: {
    fontFamily: 'Noto Serif SC',
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
  similarPinyin: {
    fontSize: 14,
    color: Colors.textLight,
  },
  similarTranslation: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  reverseList: {
    gap: 0,
  },
  reverseItem: {
    paddingVertical: 12,
    gap: 6,
  },
  reverseRussian: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reverseChinese: {
    fontFamily: 'Noto Serif SC',
    fontSize: 18,
    color: Colors.text,
  },
  reversePinyin: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
