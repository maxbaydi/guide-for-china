import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Card } from 'react-native-paper';
import { CharacterAnalysis, Character } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { EmptyState } from '../../components/ui/EmptyState';
import { CharacterCard } from '../../components/ui/CharacterCard';
import { IconButton } from '../../components/ui/IconButton';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper to assign colors to characters
const getCharColor = (index: number, theme: any) => {
    const colors = [theme.primary, theme.secondary, '#3B82F6', '#8B5CF6', '#F59E0B'];
    return colors[index % colors.length];
};

export default function AnalyzeResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const { results, originalText } = useLocalSearchParams<{ 
    results: string;
    originalText?: string;
  }>();
  const insets = useSafeAreaInsets();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  if (!results) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="text-box-search-outline"
          title={t('search.noResults')}
        />
      </View>
    );
  }

  const analysisData: CharacterAnalysis[] = JSON.parse(results);

  const handleAddToCollection = (characterId?: string) => {
    if (characterId) {
      setSelectedCharacterId(characterId);
      setModalVisible(true);
    }
  };
  
  const handleAddSuccess = () => {
    // Toast будет показан в AddToCollectionModal
  };

  // Проверка на существование данных
  if (!analysisData || !Array.isArray(analysisData) || analysisData.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title={t('errors.analysisFailed')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: t('analyze.results'),
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerRight: () => originalText ? (
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => router.back()}
            />
          ) : null,
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 24 }]}
      >
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          {t('analyze.wordsFound', { count: analysisData.length })}
        </Text>
        
        <Card variant="elevated" style={styles.textCard}>
          <Card.Content>
            <Text style={styles.originalText}>
              {analysisData.map((item, index) => (
                <Text
                  key={`word-${index}-${item.word}`}
                  style={[
                    styles.wordSpan,
                    { 
                      color: item.details ? getCharColor(index, theme) : theme.textTertiary,
                      backgroundColor: item.details ? `${getCharColor(index, theme)}15` : 'transparent',
                    }
                  ]}
                  onPress={() => {
                    if (item.details?.id) {
                      router.push(`/character/${item.details.id}`);
                    }
                  }}
                >
                  {item.word}
                </Text>
              ))}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.charactersList}>
          {analysisData
            .filter((item) => item.details) // Показываем только слова с данными
            .map((item, index) => {
              // Преобразуем CharacterAnalysis в Character для CharacterCard
              const character: Character = {
                id: item.details?.id || '',
                simplified: item.word,
                pinyin: item.details?.pinyin || '',
                definitions: item.details?.definitions || [],
                examples: item.details?.examples || [],
                hskLevel: item.details?.hskLevel,
                frequency: item.details?.frequency,
              };
              
              return (
                <CharacterCard
                  key={`card-${index}-${item.details?.id || item.word}`}
                  character={character}
                  onPress={() => {
                    if (item.details?.id) {
                      router.push(`/character/${item.details.id}`);
                    }
                  }}
                />
              );
            })}
        </View>
      </ScrollView>
      
      {selectedCharacterId && (
        <AddToCollectionModal
          visible={modalVisible}
          characterId={selectedCharacterId}
          onDismiss={() => setModalVisible(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textCard: {
    borderRadius: 16,
  },
  originalText: {
    lineHeight: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordSpan: {
    fontFamily: 'Noto Serif SC',
    fontSize: 32,
    marginRight: 4,
    marginBottom: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  charactersList: {
    gap: 12,
  },
});
