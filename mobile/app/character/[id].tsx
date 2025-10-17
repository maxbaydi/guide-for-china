import { useState } from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { api, synthesizeSpeech } from '../../services/api';
import { Character, SimilarWord, ReverseTranslation } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { DefinitionGroup } from '../../components/character/DefinitionGroup';
import { ExampleItem } from '../../components/character/ExampleItem';
import { CharacterCard } from '../../components/ui/CharacterCard';
import { showError } from '../../utils/toast';

export default function CharacterDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, shadows } = useTheme();
  const [activeTab, setActiveTab] = useState<'definitions' | 'examples' | 'similar' | 'reverse'>('definitions');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer();

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
  const { data: similarWords, isLoading: isSimilarLoading } = useQuery<SimilarWord[]>({
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
  const { data: reverseTranslations, isLoading: isReverseLoading } = useQuery<ReverseTranslation[]>({
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

  const handlePlayAudio = async () => {
    if (!character?.simplified || player.playing || isLoadingAudio) {
      return;
    }

    try {
      setIsLoadingAudio(true);
      
      // Синтезировать аудио
      const { audioUrl } = await synthesizeSpeech(character.simplified);
      
      // Воспроизвести через новый API expo-audio
      player.replace(audioUrl);
      player.play();

    } catch (error) {
      console.error('Audio playback failed:', error);
      showError('Не удалось воспроизвести аудио');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const HeaderRight = () => (
    <IconButton
      icon="bookmark-plus-outline"
      onPress={() => setModalVisible(true)}
      color={theme.primary}
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
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: t('character.details'),
          headerShown: true,
          headerRight: () => <HeaderRight />,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 24 }]}
      >
        <Card style={styles.characterCard}>
          <View style={styles.characterCardContent}>
            <Text style={[styles.character, { color: theme.text }]}>{character.simplified}</Text>
            <Text style={[styles.pinyin, { color: theme.textSecondary }]}>{character.pinyin}</Text>
            <IconButton
              icon={isLoadingAudio ? "loading" : player.playing ? "pause" : "volume-high"}
              onPress={handlePlayAudio}
              size={20}
              disabled={isLoadingAudio || player.playing}
            />
          </View>
        </Card>

        {(character.hskLevel || character.frequency) && (
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              {character.hskLevel && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>HSK</Text>
                <View style={[styles.hskBadge, { backgroundColor: theme.primaryPale }]}>
                  <Text style={[styles.hskBadgeText, { color: theme.primaryDark }]}>
                    {character.hskLevel}
                  </Text>
                </View>
              </View>
              )}
              {character.frequency && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('character.frequency')}</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{character.frequency}</Text>
              </View>
              )}
            </View>
          </Card>
        )}
        
        <View>
          <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('definitions')}
              style={[
                styles.tab,
                { borderRightColor: theme.border },
                activeTab === 'definitions' && [styles.activeTab, { borderBottomColor: theme.primary }]
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabButton,
                { color: activeTab === 'definitions' ? theme.primary : theme.textSecondary }
              ]}>
                {t('character.definitions')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('examples')}
              style={[
                styles.tab,
                { borderRightColor: theme.border },
                activeTab === 'examples' && [styles.activeTab, { borderBottomColor: theme.primary }]
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabButton,
                { color: activeTab === 'examples' ? theme.primary : theme.textSecondary }
              ]}>
                {t('character.examples')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('similar')}
              style={[
                styles.tab,
                { borderRightColor: theme.border },
                activeTab === 'similar' && [styles.activeTab, { borderBottomColor: theme.primary }]
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabButton,
                { color: activeTab === 'similar' ? theme.primary : theme.textSecondary }
              ]}>
                {t('character.similarWords')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('reverse')}
              style={[
                styles.tab,
                styles.lastTab,
                activeTab === 'reverse' && [styles.activeTab, { borderBottomColor: theme.primary }]
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabButton,
                { color: activeTab === 'reverse' ? theme.primary : theme.textSecondary }
              ]}>
                {t('character.reverseTranslations')}
              </Text>
            </TouchableOpacity>
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
                        <Divider style={[styles.divider, { backgroundColor: theme.border }]} />
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noExamplesText, { color: theme.textSecondary }]}>{t('character.noExamples')}</Text>
                )}
              </View>
            )}

            {activeTab === 'similar' && (
              <View style={styles.similarList}>
                {isSimilarLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                  </View>
                ) : similarWords && similarWords.length > 0 ? (
                  similarWords.map((word, idx) => {
                    // Преобразуем SimilarWord в Character для CharacterCard
                    const character: Character = {
                      id: word.id,
                      simplified: word.simplified,
                      pinyin: word.pinyin,
                      definitions: [{ 
                        id: `${word.id}-def`,
                        translation: word.mainTranslation,
                        order: 1
                      }],
                      examples: [],
                    };
                    
                    return (
                      <CharacterCard
                        key={`${word.id}-${idx}`}
                        character={character}
                        onPress={() => router.push(`/character/${word.id}`)}
                      />
                    );
                  })
                ) : (
                  <Text style={[styles.noExamplesText, { color: theme.textSecondary }]}>{t('character.noSimilarWords')}</Text>
                )}
              </View>
            )}

            {activeTab === 'reverse' && (
              <View style={styles.reverseList}>
                {isReverseLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                  </View>
                ) : reverseTranslations && reverseTranslations.length > 0 ? (
                  reverseTranslations.map((trans, idx) => (
                    <View key={`reverse-${idx}`}>
                      <View style={styles.reverseItem}>
                        <Text style={[styles.reverseRussian, { color: theme.text }]}>{trans.russian}</Text>
                        <Text style={[styles.reverseChinese, { color: theme.text }]}>{trans.chinese}</Text>
                        {trans.pinyin && (
                          <Text style={[styles.reversePinyin, { color: theme.textSecondary }]}>{trans.pinyin}</Text>
                        )}
                      </View>
                      {idx < reverseTranslations.length - 1 && (
                        <Divider style={[styles.divider, { backgroundColor: theme.border }]} />
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noExamplesText, { color: theme.textSecondary }]}>{t('character.noReverseTranslations')}</Text>
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
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  characterCard: {
    borderRadius: BorderRadius.xl,
  },
  characterCardContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    padding: 0,
    gap: Spacing.sm,
  },
  character: {
    fontFamily: 'Noto Serif SC',
    fontSize: 88,
    fontWeight: '700',
    letterSpacing: 2,
  },
  pinyin: {
    fontSize: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: BorderRadius.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    padding: 0,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  hskBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  hskBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    borderRightWidth: 1,
  },
  lastTab: {
    borderRightWidth: 0,
  },
  activeTab: {
    // динамический цвет применяется через inline style
  },
  tabButton: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabText: {
    // динамический цвет применяется через inline style
  },
  tabContent: {
    paddingTop: Spacing.lg,
  },
  definitionsList: {
    gap: 0,
  },
  divider: {
    // динамический цвет применяется через inline style
  },
  examplesList: {
    gap: 0,
  },
  noExamplesText: {
    textAlign: 'center',
    padding: Spacing.lg,
    fontSize: 15,
  },
  similarList: {
    gap: Spacing.md,
  },
  reverseList: {
    gap: 0,
  },
  reverseItem: {
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  reverseRussian: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  reverseChinese: {
    fontFamily: 'Noto Serif SC',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  reversePinyin: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
});
