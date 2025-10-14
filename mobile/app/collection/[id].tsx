import { useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { ActivityIndicator } from 'react-native-paper';
import { CollectionItem, Character as CharacterType } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
import { CharacterCard } from '../../components/ui/CharacterCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { showError } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';
import { useCallback } from 'react';

const GET_COLLECTION = gql`
  query GetCollection($id: String!) {
    collection(id: $id) {
      id
      name
      icon
      items {
        characterId
        character {
          id
          simplified
          pinyin
          definitions
          hskLevel
        }
      }
    }
  }
`;

export default function CollectionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, loading, refetch, error } = useQuery(GET_COLLECTION, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    context: {
      skipErrorToast: true, // Обрабатываем ошибки вручную
    },
    onError: (err) => {
      console.error('Error loading collection:', err);
      const errorMessage = getErrorMessage(err);
      showError(errorMessage);
    },
  });
  
  // Перезагружаем коллекцию при возврате на экран
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  const collection = data?.collection;

  if (loading && !collection) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="folder-search-outline"
          title={t('collections.notFound')}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${collection.icon || '📚'} ${collection.name}`,
          headerShown: true,
        }}
      />
      <FlatList
        data={collection.items.filter((item: CollectionItem) => item.character)}
        keyExtractor={(item: CollectionItem) => item.characterId}
        contentContainerStyle={styles.container}
        onRefresh={refetch}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.centered}>
            <EmptyState
              icon="folder-open-outline"
              title={t('collections.emptyCollection')}
            />
          </View>
        }
        renderItem={({ item }: { item: CollectionItem }) => {
          if (!item.character) return null;
          // Преобразуем definitions из массива строк в массив объектов
          const characterData: CharacterType = {
            ...item.character,
            definitions: Array.isArray(item.character.definitions)
              ? item.character.definitions.map((translation: string, index: number) => ({
                  id: `${item.character.id}-def-${index}`,
                  translation,
                  order: index,
                }))
              : [],
          } as CharacterType;

          return (
            <CharacterCard
              character={characterData}
              onPress={() => router.push(`/character/${item.character.id}`)}
            />
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 24,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
});
