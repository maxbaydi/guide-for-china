import { useEffect, useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { ActivityIndicator } from 'react-native-paper';
import { CollectionItem, Character as CharacterType } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { CharacterCard } from '../../components/ui/CharacterCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { showError } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';

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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { data, loading, refetch, error } = useQuery(GET_COLLECTION, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    context: {
      skipErrorToast: true, // Обрабатываем ошибки вручную
    },
  });
  
  // Обработка ошибок через useEffect вместо onError (deprecated)
  useEffect(() => {
    if (error) {
      console.error('Error loading collection:', error);
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    }
  }, [error]);
  
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
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <EmptyState
          icon="folder-search-outline"
          title={t('collections.notFound')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: `${collection.icon || '📚'} ${collection.name}`,
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
        }}
      />
      <FlatList
        data={collection.items.filter((item: CollectionItem) => item.character)}
        keyExtractor={(item: CollectionItem) => item.characterId}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, backgroundColor: theme.background }]}
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
              ? item.character.definitions.map((def: any, index: number) => {
                  if (typeof def === 'string') {
                    return {
                      id: `${item.character.id}-def-${index}`,
                      translation: def,
                      order: index,
                    };
                  }
                  return def;
                })
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    gap: 12,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
