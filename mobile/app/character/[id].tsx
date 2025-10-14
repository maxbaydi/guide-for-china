import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, IconButton, Card, ActivityIndicator, Button } from 'react-native-paper';
import { api } from '../../services/api';
import { Character } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';

export default function CharacterDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('definitions');
  const [modalVisible, setModalVisible] = useState(false);

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="text-box-search-outline"
          title={t('search.noResults')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'definitions' && (
               <View style={styles.definitionsList}>
                {character.definitions.map((def, idx) => (
                  <View key={`def-${idx}`} style={styles.definitionItemContainer}>
                    <Text style={styles.definitionItem}>
                      <Text style={styles.definitionNumber}>{idx + 1}. </Text>
                      {def.partOfSpeech && (
                        <Text style={styles.partOfSpeech}>({def.partOfSpeech}) </Text>
                      )}
                      <Text>{def.translation}</Text>
                      {def.context && (
                        <Text style={styles.definitionContext}> — {def.context}</Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {activeTab === 'examples' && (
              <View style={styles.examplesList}>
                {character.examples && character.examples.length > 0 ? (
                    character.examples.map((ex) => (
                        <View key={ex.id} style={styles.exampleItem}>
                            <Text style={styles.exampleChinese}>{ex.chinese}</Text>
                            {ex.pinyin && <Text style={styles.examplePinyin}>{ex.pinyin}</Text>}
                            <Text style={styles.exampleTranslation}>{ex.russian}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noExamplesText}>{t('character.noExamples')}</Text>
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
    gap: 12,
  },
  definitionItemContainer: {
    flexDirection: 'row',
  },
  definitionItem: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  definitionNumber: {
    fontWeight: '600',
    color: Colors.text,
  },
  partOfSpeech: {
    fontStyle: 'italic',
    color: Colors.secondary,
    fontWeight: '500',
  },
  definitionContext: {
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  examplesList: {
    gap: 16,
  },
  exampleItem: {
    gap: 4
  },
  exampleChinese: {
    fontFamily: 'Noto Serif SC',
    fontSize: 18,
  },
  examplePinyin: {
    color: Colors.textLight,
    fontSize: 14,
  },
  exampleTranslation: {
    fontSize: 16,
  },
  noExamplesText: {
    color: Colors.textLight,
    textAlign: 'center',
    padding: 16,
  },
});
