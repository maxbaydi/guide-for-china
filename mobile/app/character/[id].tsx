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
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { DefinitionGroup } from '../../components/character/DefinitionGroup';
import { ExampleItem } from '../../components/character/ExampleItem';
import { showError } from '../../utils/toast';

export default function CharacterDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
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
      color={Colors.primaryDark}
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
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 24 }]}
      >
        <Card style={styles.characterCard}>
          <View style={styles.characterCardContent}>
            <Text style={styles.character}>{character.simplified}</Text>
            <View style={styles.pinyinRow}>
              <Text style={styles.pinyin}>{character.pinyin}</Text>
              <IconButton
                icon={isLoadingAudio ? "loading" : player.playing ? "pause" : "volume-high"}
                onPress={handlePlayAudio}
                size={20}
                disabled={isLoadingAudio || player.playing}
              />
            </View>
          </View>
        </Card>

        {(character.hskLevel || character.frequency) && (
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              {character.hskLevel && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>HSK</Text>
                  <View style={styles.hskBadge}>
                    <Text style={styles.hskBadgeText}>
                      {character.hskLevel}
                    </Text>
                  </View>
                </View>
              )}
              {character.frequency && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('character.frequency')}</Text>
                  <Text style={styles.statValue}>{character.frequency}</Text>
                </View>
              )}
            </View>
          </Card>
        )}
        
        <View>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('definitions')}
              style={[styles.tab, activeTab === 'definitions' && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButton, activeTab === 'definitions' && styles.activeTabText]}>
                {t('character.definitions')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('examples')}
              style={[styles.tab, activeTab === 'examples' && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButton, activeTab === 'examples' && styles.activeTabText]}>
                {t('character.examples')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('similar')}
              style={[styles.tab, activeTab === 'similar' && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButton, activeTab === 'similar' && styles.activeTabText]}>
                {t('character.similarWords')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('reverse')}
              style={[styles.tab, activeTab === 'reverse' && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButton, activeTab === 'reverse' && styles.activeTabText]}>
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
                {isSimilarLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : similarWords && similarWords.length > 0 ? (
                  similarWords.map((word, idx) => (
                    <Card 
                      key={`${word.id}-${idx}`}
                      style={styles.similarCard}
                      onPress={() => router.push(`/character/${word.id}`)}
                    >
                      <View style={styles.similarContent}>
                        <View style={styles.similarLeft}>
                          <Text style={styles.similarChinese}>{word.simplified}</Text>
                          <Text style={styles.similarPinyin}>{word.pinyin}</Text>
                        </View>
                        <Text style={styles.similarTranslation} numberOfLines={2}>
                          {word.mainTranslation}
                        </Text>
                      </View>
                    </Card>
                  ))
                ) : (
                  <Text style={styles.noExamplesText}>{t('character.noSimilarWords')}</Text>
                )}
              </View>
            )}

            {activeTab === 'reverse' && (
              <View style={styles.reverseList}>
                {isReverseLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : reverseTranslations && reverseTranslations.length > 0 ? (
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
    // paddingTop убран - используется headerShown: true
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
    borderRadius: 16,
  },
  characterCardContent: {
    alignItems: 'center',
    paddingVertical: 8,
    padding: 0,
  },
  character: {
    fontFamily: 'Noto Serif SC',
    fontSize: 80,
    fontWeight: '700',
    color: Colors.text, // gray-800
  },
  pinyinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  pinyin: {
    fontSize: 24,
    color: Colors.textLight, // gray-500
  },
  statsCard: {
    backgroundColor: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    padding: 0,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: Colors.textLight,
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  hskBadge: {
    backgroundColor: Colors.secondary, // orange-500
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hskBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary, // cyan-500
  },
  tabButton: {
    fontSize: 14,
    color: Colors.textLight, // gray-500
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.primaryDark, // cyan-600
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
  },
  similarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: 0,
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
});
