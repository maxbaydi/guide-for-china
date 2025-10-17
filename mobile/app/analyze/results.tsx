import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Card, IconButton } from 'react-native-paper';
import { CharacterAnalysis } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddToCollectionModal } from '../../components/AddToCollectionModal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper to assign colors to characters
const getCharColor = (index: number) => {
    const colors = [Colors.primary, Colors.secondary, '#3B82F6', '#8B5CF6', '#F59E0B'];
    return colors[index % colors.length];
};

export default function AnalyzeResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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
        style={styles.container} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 24 }]}
      >
        <Text style={styles.statsText}>
          {t('analyze.charactersFound', { count: analysisData.length })}
        </Text>
        
        <Card style={styles.textCard}>
          <Card.Content>
            <Text style={styles.originalText}>
              {analysisData.map((item, index) => (
                <Text
                  key={`char-${index}-${item.character}`}
                  style={[
                    styles.characterSpan,
                    { color: item.details ? getCharColor(index) : Colors.textLight }
                  ]}
                  onPress={() => {
                    if (item.details?.id) {
                      router.push(`/character/${item.details.id}`);
                    }
                  }}
                >
                  {item.character}
                </Text>
              ))}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.charactersList}>
          {analysisData
            .filter((item) => item.details) // Показываем только иероглифы с данными
            .map((item, index) => (
            <Card
              key={`card-${index}-${item.details?.id || item.character}`}
              style={styles.characterCard}
              onPress={() => {
                if (item.details?.id) {
                  router.push(`/character/${item.details.id}`);
                }
              }}
            >
              <Card.Content>
                <View style={styles.characterCardHeader}>
                  <Text style={[styles.characterLarge, { color: getCharColor(index) }]}>
                    {item.character}
                  </Text>
                  <View style={styles.characterInfo}>
                    <Text style={styles.pinyin}>{item.details?.pinyin || ''}</Text>
                    <Text style={styles.translation} numberOfLines={2}>
                      {item.details?.definitions?.[0]?.translation || ''}
                    </Text>
                  </View>
                  <IconButton
                    icon="bookmark-plus-outline"
                    size={20}
                    onPress={() => handleAddToCollection(item.details?.id)}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
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
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  statsText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  textCard: {
     backgroundColor: Colors.white,
  },
  originalText: {
    lineHeight: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  characterSpan: {
    fontFamily: 'Noto Serif SC',
    fontSize: 18,
  },
  charactersList: {
    gap: 12,
  },
  characterCard: {
    backgroundColor: Colors.white,
  },
  characterCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  characterLarge: {
    fontSize: 40,
    fontFamily: 'Noto Serif SC',
    flexShrink: 0,
  },
  characterInfo: {
    flex: 1,
  },
  pinyin: {
    fontWeight: '600',
    fontSize: 16,
  },
  translation: {
    color: Colors.textLight,
    flexWrap: 'wrap',
  },
});
