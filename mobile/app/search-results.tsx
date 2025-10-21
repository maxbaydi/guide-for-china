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
import { useTheme } from '../contexts/ThemeContext';
import { Spacing } from '../constants/Colors';

const SEARCH_HISTORY_LIMIT = 5;

export default function SearchResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('search.resultsTitle'),
          headerBackTitle: t('search.title'),
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
        }}
      />
      
      <FlatList
        data={searchResults || []}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <Text style={[styles.resultsText, { color: theme.textSecondary }]}>
            {t('search.resultsFor', { count: searchResults?.length || 0, query: query })}
          </Text>
        }
        ListEmptyComponent={
          isLoading ? (
             <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text style={{ color: theme.text }}>{t('search.loading')}</Text>
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
  },
  listContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: '30%',
  },
  resultsText: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    fontSize: 15,
    letterSpacing: 0.2,
  }
});
