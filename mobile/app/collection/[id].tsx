import { useEffect, useCallback, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ActivityIndicator, Dialog, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CollectionItem, Character as CharacterType } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { CharacterCard } from '../../components/ui/CharacterCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { IconButton } from '../../components/ui/IconButton';
import { TextInput } from '../../components/ui/TextInput';
import { IconPicker } from '../../components/ui/IconPicker';
import { showError, showSuccess } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';
import { DEFAULT_COLLECTION_ICON, getCollectionIcon } from '../../utils/collectionIcons';

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

const UPDATE_COLLECTION = gql`
  mutation UpdateCollection($id: String!, $input: UpdateCollectionInput!) {
    updateCollection(id: $id, input: $input) {
      id
      name
      icon
    }
  }
`;

const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: String!) {
    deleteCollection(id: $id)
  }
`;

const schema = z.object({
  name: z.string().min(1, 'errors.required').max(50, 'errors.maxLength'),
  icon: z.string().min(1, 'errors.required'),
});

type FormData = z.infer<typeof schema>;

export default function CollectionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  const { data, loading, refetch, error } = useQuery(GET_COLLECTION, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    context: {
      skipErrorToast: true,
    },
  });

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', icon: DEFAULT_COLLECTION_ICON },
  });

  const [updateCollection, { loading: updating }] = useMutation(UPDATE_COLLECTION, {
    refetchQueries: ['GetCollection', 'GetMyCollections'],
    onCompleted: () => {
      showSuccess(t('collections.collectionUpdated'));
      setEditDialogVisible(false);
    },
    onError: (error) => {
      console.error('Failed to update collection:', error);
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    },
    context: {
      skipErrorToast: true,
    },
  });

  const [deleteCollection, { loading: deleting }] = useMutation(DELETE_COLLECTION, {
    refetchQueries: ['GetMyCollections'],
    onCompleted: () => {
      showSuccess(t('collections.collectionDeleted'));
      router.back();
    },
    onError: (error) => {
      console.error('Failed to delete collection:', error);
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

  const handleEdit = () => {
    if (collection) {
      reset({
        name: collection.name,
        icon: getCollectionIcon(collection.icon),
      });
      setEditDialogVisible(true);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogVisible(true);
  };

  const handleDelete = () => {
    if (id) {
      deleteCollection({
        variables: { id },
      });
    }
  };

  const handleUpdateSubmit = (data: FormData) => {
    if (id) {
      updateCollection({
        variables: {
          id,
          input: {
            name: data.name,
            icon: data.icon,
          },
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
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
          headerRight: () => (
            <View style={styles.headerButtons}>
              <IconButton
                icon="pencil"
                onPress={handleEdit}
                color={theme.text}
                backgroundColor="transparent"
                size={20}
              />
              <IconButton
                icon="delete"
                onPress={handleDeleteConfirm}
                color={theme.error}
                backgroundColor="transparent"
                size={20}
              />
            </View>
          ),
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
              onPress={() => router.push(`/character/${item.character.id}?collectionId=${id}`)}
              activeOpacity={0.9}
            >
              <CharacterCard character={characterData} />
            </TouchableOpacity>
          );
        }}
      />

      <Dialog 
        visible={deleteDialogVisible} 
        onDismiss={() => setDeleteDialogVisible(false)}
        style={{ backgroundColor: theme.surface }}
      >
        <Dialog.Title style={{ color: theme.text }}>
          {t('collections.deleteConfirmTitle')}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: theme.textSecondary }}>
            {t('collections.deleteConfirmMessage')}
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
            loading={deleting}
            disabled={deleting}
            textColor={theme.error}
          >
            {t('common.delete')}
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog 
        visible={editDialogVisible} 
        onDismiss={() => setEditDialogVisible(false)}
        style={{ backgroundColor: theme.surface }}
      >
        <Dialog.Title style={{ color: theme.text }}>
          {t('collections.editCollection')}
        </Dialog.Title>
        <Dialog.Content style={styles.editDialogContent}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('collections.nameLabel')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.name}
                errorMessage={errors.name ? t(errors.name.message as string) : undefined}
              />
            )}
          />
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <IconPicker
                selectedIcon={value}
                onSelectIcon={onChange}
              />
            )}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button 
            onPress={() => setEditDialogVisible(false)}
            textColor={theme.textSecondary}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onPress={handleSubmit(handleUpdateSubmit)}
            loading={updating}
            disabled={updating}
            textColor={theme.primary}
          >
            {t('common.save')}
          </Button>
        </Dialog.Actions>
      </Dialog>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  editDialogContent: {
    gap: 16,
    paddingTop: 16,
  },
});
