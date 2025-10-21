import { useEffect, useCallback, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ActivityIndicator, Menu, Portal, Dialog, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CollectionItem, Character as CharacterType } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { CharacterCard } from '../../components/ui/CharacterCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { showError, showSuccess } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';
import { getCollectionIcon } from '../../utils/collectionIcons';

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

const REMOVE_FROM_COLLECTION = gql`
  mutation RemoveFromCollection($collectionId: String!, $characterId: String!) {
    removeFromCollection(collectionId: $collectionId, characterId: $characterId)
  }
`;

const calculateMenuPosition = (x: number, y: number, elementWidth: number, elementHeight: number) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const MENU_WIDTH = 200;
  const MENU_HEIGHT = 60;
  const PADDING = 16;
  
  let menuX = x;
  let menuY = y + elementHeight;
  
  if (menuX + MENU_WIDTH > screenWidth - PADDING) {
    menuX = screenWidth - MENU_WIDTH - PADDING;
  }
  
  if (menuX < PADDING) {
    menuX = PADDING;
  }
  
  if (menuY + MENU_HEIGHT > screenHeight - PADDING) {
    menuY = y - MENU_HEIGHT;
  }
  
  if (menuY < PADDING) {
    menuY = PADDING;
  }
  
  return { x: menuX, y: menuY };
};

export default function CollectionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const { data, loading, refetch, error } = useQuery(GET_COLLECTION, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    context: {
      skipErrorToast: true,
    },
  });

  const [removeFromCollection, { loading: removing }] = useMutation(REMOVE_FROM_COLLECTION, {
    refetchQueries: ['GetCollection', 'GetMyCollections'],
    onCompleted: () => {
      showSuccess(t('collections.characterRemoved'));
      setDeleteDialogVisible(false);
      setSelectedCharacter(null);
    },
    onError: (error) => {
      console.error('Failed to remove character:', error);
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    },
    context: {
      skipErrorToast: true,
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

  const handleLongPress = (characterId: string, event: any) => {
    setSelectedCharacter(characterId);
    const target = event.currentTarget;
    if (target && target.measureInWindow) {
      target.measureInWindow((x: number, y: number, width: number, height: number) => {
        const position = calculateMenuPosition(x, y, width, height);
        setMenuAnchor(position);
        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

  const handleDeleteConfirm = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const handleDelete = () => {
    if (id && selectedCharacter) {
      removeFromCollection({
        variables: {
          collectionId: id,
          characterId: selectedCharacter,
        },
      });
    }
  };

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
          title: collection.name,
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerLeft: () => (
            <MaterialCommunityIcons 
              name={getCollectionIcon(collection.icon) as any} 
              size={24} 
              color={theme.primary}
              style={{ marginLeft: 12 }}
            />
          ),
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
            <TouchableOpacity
              onPress={() => router.push(`/character/${item.character.id}`)}
              onLongPress={(event) => handleLongPress(item.character.id, event)}
              activeOpacity={0.9}
            >
              <CharacterCard character={characterData} />
            </TouchableOpacity>
          );
        }}
      />

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={menuAnchor}
          contentStyle={{ backgroundColor: theme.surface }}
        >
          <Menu.Item
            onPress={handleDeleteConfirm}
            title={t('collections.removeCharacter')}
            leadingIcon="delete"
            titleStyle={{ color: theme.error }}
          />
        </Menu>

        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: theme.surface }}
        >
          <Dialog.Title style={{ color: theme.text }}>
            {t('collections.removeCharacterConfirmTitle')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.textSecondary }}>
              {t('collections.removeCharacterConfirmMessage')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDeleteDialogVisible(false)}
              textColor={theme.textSecondary}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onPress={handleDelete}
              loading={removing}
              disabled={removing}
              textColor={theme.error}
            >
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
