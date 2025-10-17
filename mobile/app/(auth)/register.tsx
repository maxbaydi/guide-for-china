import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveLanguage } from '../../services/i18n';
import { TextInput } from '../../components/ui/TextInput';
import { CustomButton } from '../../components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
  };
  
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
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
          
          <View style={styles.languageButtons}>
            <TouchableOpacity 
              style={[styles.langButton, i18n.language === 'ru' && styles.langButtonActive]}
              onPress={() => handleLanguageChange('ru')}
            >
              <Text style={[styles.langButtonText, i18n.language === 'ru' && styles.langButtonTextActive]}>RU</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langButton, i18n.language === 'zh' && styles.langButtonActive]}
              onPress={() => handleLanguageChange('zh')}
            >
              <Text style={[styles.langButtonText, i18n.language === 'zh' && styles.langButtonTextActive]}>中</Text>
            </TouchableOpacity>
          </View>

          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput 
                label={t('auth.email')} 
                value={value} 
                onChangeText={onChange} 
                error={!!errors.email}
                errorMessage={errors.email ? t(errors.email.message as string) : undefined}
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
          )} />
          
          <Controller control={control} name="username" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput 
              label={t('auth.username')} 
              value={value} 
              onChangeText={onChange} 
              error={!!errors.username}
              errorMessage={errors.username ? t(errors.username.message as string) : undefined}
              autoCapitalize="none" 
            />
          )} />

          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
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
          )} />
          
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput 
              label={t('auth.confirmPassword')} 
              value={value} 
              onChangeText={onChange} 
              secureTextEntry={!showPassword} 
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword ? t(errors.confirmPassword.message as string) : undefined}
            />
          )} />

          {serverError && <HelperText type="error" visible={!!serverError}>{serverError}</HelperText>}

          <CustomButton 
            variant="primary"
            onPress={handleSubmit(handleRegister)} 
            loading={isLoading} 
            disabled={isLoading} 
            style={styles.button}
          >
            {t('auth.registerButton')}
          </CustomButton>
          
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  langButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  langButtonTextActive: {
    color: Colors.white,
  },
});
