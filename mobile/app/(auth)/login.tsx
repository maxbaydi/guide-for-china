import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Colors';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveLanguage } from '../../services/i18n';
import { TextInput } from '../../components/ui/TextInput';
import { CustomButton } from '../../components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const schema = z.object({
  email: z.string().email('errors.invalidEmail'),
  password: z.string().min(1, 'errors.required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const { theme, shadows } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
  };
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: theme.primary, ...shadows.large }]}>
              <Text style={[styles.logoText, { color: theme.textInverse }]}>汉</Text>
            </View>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.text }]}>
              HanGuide
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('app.description')}
            </Text>
          </View>
          
          <View style={styles.languageButtons}>
            <TouchableOpacity 
              style={[
                styles.langButton, 
                { 
                  borderColor: theme.border,
                  backgroundColor: i18n.language === 'ru' ? theme.primary : theme.surface 
                }
              ]}
              onPress={() => handleLanguageChange('ru')}
            >
              <Text style={[
                styles.langButtonText, 
                { color: i18n.language === 'ru' ? theme.textInverse : theme.text }
              ]}>RU</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.langButton, 
                { 
                  borderColor: theme.border,
                  backgroundColor: i18n.language === 'zh' ? theme.primary : theme.surface 
                }
              ]}
              onPress={() => handleLanguageChange('zh')}
            >
              <Text style={[
                styles.langButtonText, 
                { color: i18n.language === 'zh' ? theme.textInverse : theme.text }
              ]}>中</Text>
            </TouchableOpacity>
          </View>
          
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.email')}
                value={value}
                onChangeText={onChange}
                error={!!errors.email}
                errorMessage={errors.email ? t(errors.email.message as string) : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('auth.password')}
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                error={!!errors.password}
                errorMessage={errors.password ? t(errors.password.message as string) : undefined}
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          {serverError && (
            <HelperText type="error" visible={!!serverError}>
              {serverError}
            </HelperText>
          )}

          <CustomButton
            variant="primary"
            onPress={handleSubmit(handleLogin)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            {t('auth.loginButton')}
          </CustomButton>
          
          <View style={styles.footer}>
            <Link href="/(auth)/register" asChild>
              <Text variant="bodyLarge" style={{ color: theme.text }}>
                {t('auth.dontHaveAccount')}{' '}
                <Text style={[styles.link, { color: theme.primary }]}>{t('auth.registerButton')}</Text>
              </Text>
            </Link>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 56,
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  link: {
    fontWeight: '700',
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  langButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  langButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
