import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('errors.invalidEmail'),
  username: z.string().min(3, 'errors.minLength').max(20, 'errors.maxLength'),
  password: z.string().min(8, 'errors.passwordTooShort'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "errors.passwordsDontMatch",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const handleRegister = async (data: FormData) => {
    setIsLoading(true);
    setServerError('');
    try {
      await register(data);
      router.replace('/(tabs)/search');
    } catch (err: any) {
      setServerError(err.message || t('errors.registerFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              {t('auth.registerTitle')}
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              {t('app.description')}
            </Text>
          </View>

          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label={t('auth.email')} value={value} onBlur={onBlur} onChangeText={onChange} error={!!errors.email} keyboardType="email-address" autoCapitalize="none" />
          )} />
          {errors.email && <HelperText type="error">{t(errors.email.message as string)}</HelperText>}
          
          <Controller control={control} name="username" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label={t('auth.username')} value={value} onBlur={onBlur} onChangeText={onChange} error={!!errors.username} autoCapitalize="none" />
          )} />
          {errors.username && <HelperText type="error">{t(errors.username.message as string)}</HelperText>}

          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label={t('auth.password')} value={value} onBlur={onBlur} onChangeText={onChange} secureTextEntry={!showPassword} error={!!errors.password} right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />} />
          )} />
          {errors.password && <HelperText type="error">{t(errors.password.message as string)}</HelperText>}
          
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label={t('auth.confirmPassword')} value={value} onBlur={onBlur} onChangeText={onChange} secureTextEntry={!showPassword} error={!!errors.confirmPassword} />
          )} />
          {errors.confirmPassword && <HelperText type="error">{t(errors.confirmPassword.message as string)}</HelperText>}

          {serverError && <HelperText type="error" visible={!!serverError}>{serverError}</HelperText>}

          <Button onPress={handleSubmit(handleRegister)} loading={isLoading} disabled={isLoading} mode="contained" style={styles.button} labelStyle={styles.buttonLabel}>
            {t('auth.registerButton')}
          </Button>
          
          <View style={styles.footer}>
            <Link href="/(auth)/login" asChild>
              <Text variant="bodyLarge">
                {t('auth.alreadyHaveAccount')}{' '}
                <Text style={styles.link}>{t('auth.loginButton')}</Text>
              </Text>
            </Link>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textLight,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  buttonLabel: {
      paddingVertical: 8,
      fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
