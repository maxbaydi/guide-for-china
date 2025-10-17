import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation, gql } from '@apollo/client';
import { Text, HelperText } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from '../../contexts/ThemeContext';
import { TextInput } from '../../components/ui/TextInput';
import { CustomButton } from '../../components/ui/Button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen 
        options={{ 
          title: t('collections.createNew'), 
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
        }} 
      />
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text variant="headlineLarge" style={styles.title}>{t('collections.newCollection')}</Text>
      </View>
      
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('collections.nameLabel')}
            value={value}
            onChangeText={onChange}
            error={!!errors.name}
            errorMessage={errors.name ? t(errors.name.message as string) : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="icon"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('collections.iconLabel')}
            value={value}
            onChangeText={onChange}
            error={!!errors.icon}
            errorMessage={errors.icon ? t(errors.icon.message as string) : undefined}
            maxLength={2}
          />
        )}
      />

      <View style={styles.buttonRow}>
        <CustomButton 
          variant="outlined" 
          onPress={() => router.back()}
          style={styles.flexButton}
        >
          {t('common.cancel')}
        </CustomButton>
        <CustomButton 
          variant="primary" 
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.flexButton}
        >
          {t('common.create')}
        </CustomButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  header: {
      // paddingTop убран - используется insets.top + 24
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
