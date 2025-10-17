import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { Portal, Dialog, Text, RadioButton, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Colors } from '../constants/Colors';
import { showSuccess, showError } from '../utils/toast';
import { getErrorMessage } from '../utils/errorHandler';

const GET_MY_COLLECTIONS = gql`
  query GetMyCollections {
    myCollections {
      id
      name
      icon
    }
  }
`;

const ADD_TO_COLLECTION = gql`
  mutation AddToCollection($collectionId: String!, $input: AddToCollectionInput!) {
    addToCollection(collectionId: $collectionId, input: $input) {
      id
    }
  }
`;

interface AddToCollectionModalProps {
  visible: boolean;
  characterId: string;
  onDismiss: () => void;
  onSuccess?: (collectionName: string) => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  visible,
  characterId,
  onDismiss,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [slideAnim] = useState(new Animated.Value(0));

  const { data, loading, refetch } = useQuery(GET_MY_COLLECTIONS, {
    skip: !visible,
    fetchPolicy: 'network-only',
  });

  const [addToCollection, { loading: adding }] = useMutation(ADD_TO_COLLECTION, {
    onCompleted: () => {
      const selectedCollection = collections.find((c: any) => c.id === selectedCollectionId);
      const collectionName = selectedCollection?.name || t('collections.favorites');
      
      showSuccess(t('collections.addedTo', { name: collectionName }));
      
      onSuccess?.(collectionName);
      onDismiss();
      
      // Сбрасываем выбор для следующего открытия
      setSelectedCollectionId(null);
    },
    onError: (error) => {
      console.error('Failed to add to collection:', error);
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    },
    refetchQueries: ['GetMyCollections'],
    context: {
      skipErrorToast: true, // Обрабатываем ошибки вручную
    },
  });

  const collections = data?.myCollections || [];

  // Анимация появления/скрытия модального окна
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleAdd = () => {
    if (!selectedCollectionId) {
      showError(t('collections.selectCollection'));
      return;
    }
    
    addToCollection({
      variables: {
        collectionId: selectedCollectionId,
        input: {
          characterId,
        },
      },
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0], // Начинаем за экраном, заканчиваем на позиции 0
  });

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Animated.View style={[styles.dialogContent, { transform: [{ translateY }] }]}>
          <Dialog.Title>{t('character.addToCollection')}</Dialog.Title>
        <Dialog.Content>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : collections.length === 0 ? (
            <Text style={styles.emptyText}>{t('collections.emptyCollection')}</Text>
          ) : (
            <RadioButton.Group
              onValueChange={(value) => setSelectedCollectionId(value)}
              value={selectedCollectionId || ''}
            >
              <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <RadioButton.Item
                    label={`${item.icon || '📚'} ${item.name}`}
                    value={item.id}
                    labelStyle={styles.radioLabel}
                  />
                )}
                ItemSeparatorComponent={() => <Divider />}
                style={styles.list}
              />
            </RadioButton.Group>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} textColor={Colors.textLight}>
            {t('common.cancel')}
          </Button>
          <Button
            onPress={handleAdd}
            disabled={!selectedCollectionId || adding}
            loading={adding}
            mode="contained"
            style={styles.addButton}
          >
            {t('common.save')}
          </Button>
        </Dialog.Actions>
        </Animated.View>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    // Стили для анимированного контента
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    padding: 16,
  },
  list: {
    maxHeight: 300,
  },
  radioLabel: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
});

