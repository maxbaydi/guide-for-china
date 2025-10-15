import { useCallback, useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, gql } from '@apollo/client';
import { Text, Card, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Collection } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
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
    <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            {t('collections.title')}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {t('collections.subtitle')}
          </Text>
        </View>

      <Card style={styles.card}>
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={
              <EmptyState
                icon="folder-multiple-outline"
                title={t('collections.emptyCollection') || 'Нет коллекций'}
                description={t('collections.emptyDescription') || 'Создайте первую коллекцию'}
             />
          }
          renderItem={({ item }) => (
            <Card.Content style={styles.collectionItem} onTouchEnd={() => router.push(`/collection/${item.id}`)}>
                <View>
                  <Text style={styles.collectionName}>{item.icon} {item.name}</Text>
                  <Text style={styles.collectionMeta}>{item.itemCount} {t('collections.words')}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textLight} />
            </Card.Content>
          )}
        />
      </Card>
      
       <Button 
          mode="text" 
          onPress={handleCreateCollection} 
          style={styles.createButton}
          labelStyle={styles.createButtonText}
          icon="plus"
        >
          {t('collections.createNew')}
        </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
    gap: 24,
  },
  centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textLight,
  },
  card: {
    backgroundColor: Colors.white,
  },
  collectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  collectionMeta: {
    color: Colors.textLight,
    fontSize: 14,
  },
  createButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    paddingVertical: 8,
  },
  createButtonText: {
      color: Colors.textLight,
      fontWeight: '600',
  }
});
