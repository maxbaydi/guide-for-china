import { useEffect } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../services/api';
import { Character } from '../types/api.types';
import { CharacterCard } from '../components/ui/CharacterCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Colors } from '../constants/Colors';

const SEARCH_HISTORY_LIMIT = 5;

export default function SearchResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query: string }>();
  const insets = useSafeAreaInsets();

  const {
    data: searchResults,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Character[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await api.get('/dictionary/search', {
        params: { query: query, limit: 20 },
      });
      return data;
    },
    enabled: !!query,
  });

  // Сохранение в историю поиска при успешном поиске
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && query) {
      saveToSearchHistory(query);
    }
  }, [searchResults, query]);

  const saveToSearchHistory = async (searchQuery: string) => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      let historyArray: string[] = history ? JSON.parse(history) : [];
      
      // Удаляем дубликаты и добавляем в начало
      historyArray = historyArray.filter(item => item !== searchQuery);
      historyArray.unshift(searchQuery);
      
      // Ограничиваем до 5 элементов
      historyArray = historyArray.slice(0, SEARCH_HISTORY_LIMIT);
      
      await AsyncStorage.setItem('searchHistory', JSON.stringify(historyArray));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('search.resultsTitle'),
          headerBackTitle: t('search.title'),
        }}
      />
      
      <FlatList
        data={searchResults || []}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.resultsText}>
            {t('search.resultsFor', { count: searchResults?.length || 0, query: query })}
          </Text>
        }
        ListEmptyComponent={
          isLoading ? (
             <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>{t('search.loading')}</Text>
             </View>
          ) : (
            <EmptyState
              icon="magnify-close"
              title={t('search.noResults') || 'Ничего не найдено'}
              description={t('search.tryDifferentQuery') || 'Попробуйте изменить запрос'}
            />
          )
        }
        renderItem={({ item }) => (
          <CharacterCard
            character={item}
            onPress={() => router.push(`/character/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 24,
    // paddingTop убран - используется insets.top + 24
    gap: 8,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: '30%',
  },
  resultsText: {
    color: Colors.textLight,
    marginBottom: 16,
    paddingHorizontal: 8,
  }
});
