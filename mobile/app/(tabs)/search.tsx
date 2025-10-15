import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, StyleSheet, AppState, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { APP_CONFIG } from '../../constants/config';
import { SearchBar } from '../../components/ui/SearchBar';
import { Chip } from '../../components/ui/Chip';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { CustomButton } from '../../components/ui/Button';
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
          <Text style={styles.headerGreeting}>{t('search.greeting')}</Text>
          <Text style={styles.headerName}>
            {user?.username || 'Test User'}
          </Text>
        </View>
        <Avatar 
          initials={user?.username?.charAt(0) || 'U'} 
          size={40}
        />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('search.placeholder')}
        onSubmitEditing={handleSearch}
      />
      
      <CustomButton 
        variant="primary"
        onPress={handleSearch}
        disabled={!query.trim()}
        style={styles.searchButton}
      >
        {t('search.searchButton')}
      </CustomButton>
      
      {searchHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('search.history')}</Text>
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
          <Text style={styles.sectionTitle}>{t('search.wordOfTheDay')}</Text>
          {isLoadingWord ? (
            <Card style={styles.wordOfTheDayCard}>
              <View style={styles.wordOfTheDayContent}>
                <ActivityIndicator size="large" color={Colors.white} />
              </View>
            </Card>
          ) : wordOfTheDay ? (
            <Card variant="gradient" onPress={() => navigateToCharacter(wordOfTheDay.id)} style={styles.wordOfTheDayCard}>
              <View style={styles.wordOfTheDayContent}>
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
              </View>
            </Card>
          ) : wordError ? (
            <Card variant="gradient" style={styles.wordOfTheDayCard}>
              <View>
                <Text style={{ color: Colors.white, textAlign: 'center' }}>
                  {t('search.wordOfTheDayUnavailable')}
                </Text>
              </View>
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
    fontSize: 14,
    color: Colors.textLight, // gray-500
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text, // gray-800
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  chipContainer: {
    gap: 8,
  },
  wordOfTheDayCard: {
    borderRadius: 16,
  },
  wordOfTheDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 0,
  },
  wordOfTheDayChar: {
    fontFamily: 'Noto Serif SC',
    fontSize: 52,
    fontWeight: '700',
    color: Colors.white,
  },
  wordOfTheDayInfo: {
    flex: 1,
    gap: 4,
  },
  wordOfTheDayTranslation: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  wordOfTheDayExample: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  searchButton: {
    backgroundColor: Colors.secondary, // orange-500
  },
  searchButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
