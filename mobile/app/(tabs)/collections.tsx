import { useCallback, useEffect } from 'react';
import { FlatList, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Collection } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { CustomButton } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { showError } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';

const GET_MY_COLLECTIONS = gql`
  query GetMyCollections {
    myCollections {
      id
      name
      icon
      itemCount
    }
  }
`;

export default function CollectionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();

  const { data, loading, refetch, error } = useQuery(GET_MY_COLLECTIONS, {
    fetchPolicy: 'cache-and-network',
    context: {
      skipErrorToast: true, // Обрабатываем ошибки вручную
    },
  });
  
  // Обработка ошибок через useEffect вместо onError (deprecated)
  useEffect(() => {
    if (error) {
      console.error('Error loading collections:', error);
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    }
  }, [error]);
  
  // Перезагружаем коллекции при возврате на экран
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const collections: Collection[] = data?.myCollections || [];
  
  const handleCreateCollection = () => {
    // Navigate to create collection screen - to be implemented
    router.push('/collection/create');
  };
  
  if (loading && !data) {
      return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('collections.title')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('collections.subtitle')}
        </Text>
      </View>

      <Card variant="elevated" style={styles.card}>
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <Divider style={{ backgroundColor: theme.border }} />}
          ListEmptyComponent={
            <EmptyState
              icon="folder-multiple-outline"
              title={t('collections.emptyCollection') || 'Нет коллекций'}
              description={t('collections.emptyDescription') || 'Создайте первую коллекцию'}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.collectionItem} 
              onPress={() => router.push(`/collection/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.collectionInfo}>
                <Text style={[styles.collectionName, { color: theme.text }]}>
                  {item.icon} {item.name}
                </Text>
                <Text style={[styles.collectionMeta, { color: theme.textSecondary }]}>
                  {item.itemCount} {t('collections.words')}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.primary} />
            </TouchableOpacity>
          )}
        />
      </Card>
      
      <CustomButton 
        variant="dashed"
        onPress={handleCreateCollection}
        style={styles.createButton}
        icon={<MaterialCommunityIcons name="plus" size={20} color={theme.textSecondary} />}
      >
        {t('collections.createNew')}
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 120,
    gap: Spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
  },
  collectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  collectionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  collectionMeta: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  createButton: {
    marginTop: Spacing.md,
  },
});
