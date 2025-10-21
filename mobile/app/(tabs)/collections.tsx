import { useCallback, useEffect, useState, useRef } from 'react';
import { FlatList, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Divider, ActivityIndicator, Menu, Portal, Dialog, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Collection } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { CustomButton } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { TextInput } from '../../components/ui/TextInput';
import { IconPicker } from '../../components/ui/IconPicker';
import { showError, showSuccess } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';
import { DEFAULT_COLLECTION_ICON, getCollectionIcon } from '../../utils/collectionIcons';

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

const calculateMenuPosition = (x: number, y: number, elementWidth: number, elementHeight: number) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const MENU_WIDTH = 200;
  const MENU_HEIGHT = 100;
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

export default function CollectionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const menuAnchorRef = useRef<View>(null);

  const { data, loading, refetch, error } = useQuery(GET_MY_COLLECTIONS, {
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
    refetchQueries: ['GetMyCollections'],
    onCompleted: () => {
      showSuccess(t('collections.collectionUpdated'));
      setEditDialogVisible(false);
      setSelectedCollection(null);
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
      setDeleteDialogVisible(false);
      setSelectedCollection(null);
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
    router.push('/collection/create');
  };

  const handleLongPress = (collection: Collection, event: any) => {
    setSelectedCollection(collection);
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

  const handleEdit = () => {
    setMenuVisible(false);
    if (selectedCollection) {
      reset({
        name: selectedCollection.name,
        icon: getCollectionIcon(selectedCollection.icon),
      });
      setEditDialogVisible(true);
    }
  };

  const handleDeleteConfirm = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const handleDelete = () => {
    if (selectedCollection) {
      deleteCollection({
        variables: { id: selectedCollection.id },
      });
    }
  };

  const handleUpdateSubmit = (data: FormData) => {
    if (selectedCollection) {
      updateCollection({
        variables: {
          id: selectedCollection.id,
          input: {
            name: data.name,
            icon: data.icon,
          },
        },
      });
    }
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
              onLongPress={(event) => handleLongPress(item, event)}
              activeOpacity={0.7}
            >
              <View style={styles.collectionInfo}>
                <View style={styles.collectionHeader}>
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={24} 
                    color={theme.primary} 
                  />
                  <Text style={[styles.collectionName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                </View>
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

      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={menuAnchor}
          contentStyle={{ backgroundColor: theme.surface }}
        >
          <Menu.Item
            onPress={handleEdit}
            title={t('collections.editCollection')}
            leadingIcon="pencil"
            titleStyle={{ color: theme.text }}
          />
          <Menu.Item
            onPress={handleDeleteConfirm}
            title={t('collections.deleteCollection')}
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
      </Portal>
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
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  editDialogContent: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
});
