import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, StyleSheet, AppState } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Avatar, Card, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { APP_CONFIG } from '../../constants/config';
import { SearchBar } from '../../components/ui/SearchBar';
import { Chip } from '../../components/ui/Chip';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import { Character } from '../../types/api.types';

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isWordOfDayEnabled, setIsWordOfDayEnabled] = useState(true);

  const { data: wordOfTheDay, isLoading: isLoadingWord, error: wordError, refetch: refetchWord } = useQuery<Character>({
    queryKey: ['wordOfTheDay'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/dictionary/word-of-the-day', {
          skipErrorToast: true,
        } as any);
        console.log('Word of the day loaded:', data);
        return data;
      } catch (error: any) {
        console.error('Word of the day error:', error);
        if (error.response?.status === 404 || error.response?.status === 500) {
          return null; // Нормальная ситуация - слово дня не настроено или ошибка
        }
        return null;
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // Кеш на 24 часа
    retry: 1, // Попробовать 1 раз перезапросить при ошибке
    enabled: isWordOfDayEnabled, // Загружать только если настройка включена
  });

  // Перезагрузка настроек при возврате на экран
  useFocusEffect(
    useCallback(() => {
      loadWordOfDaySetting();
      loadSearchHistory();
    }, [])
  );

  const loadWordOfDaySetting = async () => {
    try {
      const value = await AsyncStorage.getItem('wordOfDayEnabled');
      if (value !== null) {
        const enabled = JSON.parse(value);
        setIsWordOfDayEnabled(enabled);
      }
    } catch (error) {
      console.error('Failed to load word of day setting:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };
  
  const handleHistoryClick = (term: string) => {
    setQuery(term);
    // Сразу запускаем поиск
    if (term.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(term.trim())}`);
    }
  };

  const navigateToCharacter = (id: string) => {
    router.push(`/character/${id}`);
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text variant="bodySmall" style={styles.headerGreeting}>{t('search.greeting')}</Text>
          <Text variant="headlineMedium" style={styles.headerName}>
            {user?.username || 'Test User'}
          </Text>
        </View>
        <Avatar.Icon size={40} icon="account-circle" />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('search.placeholder')}
        onSubmitEditing={handleSearch}
      />
      
      <Button 
        mode="contained" 
        onPress={handleSearch}
        disabled={!query.trim()}
        style={styles.searchButton}
        contentStyle={{ height: 48 }}
        labelStyle={styles.searchButtonLabel}
        icon="magnify"
      >
        {t('search.searchButton')}
      </Button>
      
      {searchHistory.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('search.history')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
            {searchHistory.map((item, index) => (
              <Chip
                key={`${item}-${index}`}
                onPress={() => handleHistoryClick(item)}
              >
                {item}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      {isWordOfDayEnabled && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('search.wordOfTheDay')}</Text>
          {isLoadingWord ? (
            <Card style={styles.wordOfTheDayCard}>
              <Card.Content style={styles.wordOfTheDayContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </Card.Content>
            </Card>
          ) : wordOfTheDay ? (
            <Card style={styles.wordOfTheDayCard} onPress={() => navigateToCharacter(wordOfTheDay.id)}>
              <Card.Content style={styles.wordOfTheDayContent}>
                <Text style={styles.wordOfTheDayChar}>{wordOfTheDay.simplified}</Text>
                <View style={styles.wordOfTheDayInfo}>
                  <Text style={styles.wordOfTheDayTranslation}>
                    {wordOfTheDay.definitions && wordOfTheDay.definitions.length > 0
                      ? wordOfTheDay.definitions[0].translation
                      : t('character.noTranslation')}
                  </Text>
                  {wordOfTheDay.examples && wordOfTheDay.examples.length > 0 && (
                    <Text style={styles.wordOfTheDayExample} numberOfLines={2}>
                      {wordOfTheDay.examples[0].chinese}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ) : wordError ? (
            <Card style={styles.wordOfTheDayCard}>
              <Card.Content>
                <Text style={{ color: Colors.textLight, textAlign: 'center' }}>
                  {t('search.wordOfTheDayUnavailable')}
                </Text>
              </Card.Content>
            </Card>
          ) : null}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120, // For bottom nav
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    color: Colors.textLight,
  },
  headerName: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.text,
  },
  chipContainer: {
    gap: 8,
  },
  wordOfTheDayCard: {
    backgroundColor: '#FFF0F0', // A light red, similar to 'from-red-50 to-red-100'
    borderColor: '#FED7D7', // red-200/50
    borderWidth: 1,
  },
  wordOfTheDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  wordOfTheDayChar: {
    fontFamily: 'Noto Serif SC',
    fontSize: 52,
    color: Colors.primary,
  },
  wordOfTheDayInfo: {
    flex: 1,
    gap: 4,
  },
  wordOfTheDayTranslation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000', // Черный цвет для контраста с розовым фоном
  },
  wordOfTheDayExample: {
    fontSize: 14,
    color: '#4A5568', // Темно-серый цвет для лучшей читаемости
    fontStyle: 'italic',
  },
  searchButton: {
    backgroundColor: Colors.primary,
  },
  searchButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
