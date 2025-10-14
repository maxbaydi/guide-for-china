import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation, gql } from '@apollo/client';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Colors } from '../../constants/Colors';

const CREATE_COLLECTION = gql`
  mutation CreateCollection($name: String!, $icon: String) {
    createCollection(input: { name: $name, icon: $icon }) {
      id
      name
      icon
    }
  }
`;

const schema = z.object({
  name: z.string().min(1, 'errors.required').max(50, 'errors.maxLength'),
  icon: z.string().max(2, 'errors.maxLength'),
});

type FormData = z.infer<typeof schema>;

export default function CreateCollectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [createCollection, { loading }] = useMutation(CREATE_COLLECTION, {
    refetchQueries: ['GetMyCollections'],
    onCompleted: () => {
      router.back();
    },
    // TODO: Add onError handling
  });

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', icon: '📚' },
  });

  const onSubmit = (data: FormData) => {
    createCollection({ variables: data });
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('collections.createNew'), headerShown: true }} />
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>{t('collections.newCollection')}</Text>
      </View>
      
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('collections.nameLabel')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.name}
          />
        )}
      />
      {errors.name && <HelperText type="error">{t(errors.name.message as string)}</HelperText>}

      <Controller
        control={control}
        name="icon"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('collections.iconLabel')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.icon}
            maxLength={2}
          />
        )}
      />
      {errors.icon && <HelperText type="error">{t(errors.icon.message as string)}</HelperText>}

      <View style={styles.buttonRow}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.flexButton}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.flexButton}
        >
          {t('common.create')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    gap: 16,
  },
  header: {
      paddingTop: 32,
  },
  title: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  flexButton: {
    flex: 1,
  }
});
