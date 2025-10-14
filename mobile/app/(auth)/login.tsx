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
  password: z.string().min(1, 'errors.required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (data: FormData) => {
    setIsLoading(true);
    setServerError('');
    try {
      await login(data);
      router.replace('/(tabs)/search');
    } catch (err: any) {
      setServerError(err.message || t('errors.loginFailed'));
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
            <View style={styles.logo}>
              <Text style={styles.logoText}>汉</Text>
            </View>
            <Text variant="headlineLarge" style={styles.title}>
              HanGuide
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              {t('app.description')}
            </Text>
          </View>
          
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.email')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && <HelperText type="error">{t(errors.email.message as string)}</HelperText>}
          
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
               <TextInput
                label={t('auth.password')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                error={!!errors.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            )}
          />
           {errors.password && <HelperText type="error">{t(errors.password.message as string)}</HelperText>}

          {serverError && (
            <HelperText type="error" visible={!!serverError}>
              {serverError}
            </HelperText>
          )}

          <Button
            onPress={handleSubmit(handleLogin)}
            loading={isLoading}
            disabled={isLoading}
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {t('auth.loginButton')}
          </Button>
          
          <View style={styles.footer}>
            <Link href="/(auth)/register" asChild>
              <Text variant="bodyLarge">
                {t('auth.dontHaveAccount')}{' '}
                <Text style={styles.link}>{t('auth.registerButton')}</Text>
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
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontFamily: 'Noto Serif SC',
    color: Colors.white,
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
