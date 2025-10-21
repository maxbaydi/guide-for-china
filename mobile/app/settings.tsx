import { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card, Switch, SegmentedButtons } from 'react-native-paper';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../constants/Colors';
import { showSuccess, showError } from '../utils/toast';
import { getErrorMessage } from '../utils/errorHandler';
import { saveLanguage } from '../services/i18n';
import { TextInput } from '../components/ui/TextInput';
import { CustomButton } from '../components/ui/Button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Profile fields
  const [username, setUsername] = useState(user?.username || '');
  
  // Update fields when user data loads
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isWordOfDayEnabled, setIsWordOfDayEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'ru');
  const { refreshUser } = useAuth();

  // Load word of day setting from AsyncStorage
  useEffect(() => {
    const loadWordOfDaySetting = async () => {
      try {
        const value = await AsyncStorage.getItem('wordOfDayEnabled');
        if (value !== null) {
          setIsWordOfDayEnabled(JSON.parse(value));
        }
      } catch (error) {
        console.error('Failed to load word of day setting:', error);
      }
    };
    loadWordOfDaySetting();
  }, []);

  // Save word of day setting to AsyncStorage
  const handleWordOfDayToggle = async (value: boolean) => {
    setIsWordOfDayEnabled(value);
    try {
      await AsyncStorage.setItem('wordOfDayEnabled', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save word of day setting:', error);
      showError(t('errors.settingsSaveFailed'));
    }
  };

  // Handle language change
  const handleLanguageChange = async (language: string) => {
    try {
      setCurrentLanguage(language);
      await i18n.changeLanguage(language);
      await saveLanguage(language);
      showSuccess(t('settings.profileUpdated'));
    } catch (error) {
      console.error('Failed to change language:', error);
      showError(t('errors.languageChangeFailed'));
    }
  };

  const [updateProfile, { loading: updatingProfile, error: profileError }] = useMutation(UPDATE_PROFILE, {
    onCompleted: async () => {
      showSuccess(t('settings.profileUpdated'));
      // Обновляем данные пользователя
      await refreshUser();
    },
    context: {
      skipErrorToast: true, // Обрабатываем ошибки вручную
    },
  });

  const [changePassword, { loading: changingPassword, error: passwordError }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      showSuccess(t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    context: {
      skipErrorToast: true,
    },
  });

  // Обработка ошибок через useEffect вместо onError (deprecated)
  useEffect(() => {
    if (profileError) {
      const errorMessage = getErrorMessage(profileError);
      showError(errorMessage);
    }
  }, [profileError]);

  useEffect(() => {
    if (passwordError) {
      const errorMessage = getErrorMessage(passwordError);
      showError(errorMessage);
    }
  }, [passwordError]);

  const handleSaveProfile = () => {
    const input: any = {};
    
    // Валидация username
    if (username && username !== user?.username) {
      const trimmedUsername = username.trim();
      
      if (trimmedUsername.length < 3) {
        showError(t('errors.usernameTooShort'));
        return;
      }
      
      if (trimmedUsername.length > 50) {
        showError(t('errors.usernameTooLong'));
        return;
      }
      
      // Проверка на допустимые символы
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        showError(t('errors.usernameInvalidChars'));
        return;
      }
      
      input.username = trimmedUsername;
    }
    
    if (Object.keys(input).length > 0) {
      updateProfile({ variables: { input } });
    } else {
      showError(t('errors.noChanges'));
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      showError(t('errors.passwordsDontMatch'));
      return;
    }

    if (newPassword.length < 8) {
      showError(t('errors.passwordTooShort'));
      return;
    }

    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      showError(t('errors.passwordRequirements'));
      return;
    }

    changePassword({
      variables: {
        input: {
          currentPassword,
          newPassword,
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen 
        options={{ 
          title: t('profile.settings'), 
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
        }} 
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 12 }]}
      >
      
      {/* Profile Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.profile')}</Text>
      </View>
      
      <Card style={[styles.card, { backgroundColor: theme.surface }]}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            label={t('auth.username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text variant="bodySmall" style={styles.helperText}>
            {t('settings.usernameHelperText')}
          </Text>
          <CustomButton 
            variant="primary" 
            onPress={handleSaveProfile}
            loading={updatingProfile}
            disabled={updatingProfile || username === user?.username}
            style={styles.button}
          >
            {t('common.save')}
          </CustomButton>
        </Card.Content>
      </Card>

      {/* Security Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.security')}</Text>
      </View>
      
      <Card style={[styles.card, { backgroundColor: theme.surface }]}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            label={t('settings.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextInput
            label={t('settings.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            label={t('settings.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Text variant="bodySmall" style={styles.passwordHint}>
            {t('errors.passwordRequirements')}
          </Text>
          <CustomButton 
            variant="primary" 
            onPress={handleChangePassword}
            loading={changingPassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            style={styles.button}
          >
            {t('settings.changePassword')}
          </CustomButton>
        </Card.Content>
      </Card>

      {/* Preferences Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.preferences')}</Text>
      </View>
      
      <Card style={[styles.card, { backgroundColor: theme.surface }]}>
        {/* Theme Selector */}
        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.theme')}</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{t('settings.themeDescription')}</Text>
          </View>
        </View>
        <View style={styles.languageSwitcher}>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(value) => setThemeMode(value as 'light' | 'dark' | 'system')}
            buttons={[
              {
                value: 'light',
                label: t('settings.themeLight'),
                icon: 'white-balance-sunny',
              },
              {
                value: 'dark',
                label: t('settings.themeDark'),
                icon: 'weather-night',
              },
              {
                value: 'system',
                label: t('settings.themeSystem'),
                icon: 'theme-light-dark',
              },
            ]}
          />
        </View>

        {/* Language Selector */}
        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.language')}</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{t('settings.languageDescription')}</Text>
          </View>
        </View>
        <View style={styles.languageSwitcher}>
          <SegmentedButtons
            value={currentLanguage}
            onValueChange={handleLanguageChange}
            buttons={[
              {
                value: 'ru',
                label: t('settings.russian'),
                icon: 'flag',
              },
              {
                value: 'zh',
                label: t('settings.chinese'),
                icon: 'flag',
              },
            ]}
          />
        </View>
        
        {/* Word of the Day Toggle */}
        <View style={styles.settingItem}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.wordOfTheDay')}</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{t('settings.wordOfTheDayDescription')}</Text>
          </View>
          <Switch 
            value={isWordOfDayEnabled} 
            onValueChange={handleWordOfDayToggle} 
          />
        </View>
      </Card>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    gap: Spacing.lg,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  card: {
    borderRadius: BorderRadius.xl,
  },
  cardContent: {
    gap: Spacing.md,
  },
  helperText: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.xs,
  },
  button: {
    marginTop: Spacing.sm,
  },
  passwordHint: {
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  languageSwitcher: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
