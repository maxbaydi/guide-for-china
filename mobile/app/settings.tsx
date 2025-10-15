import { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card, Switch, TextInput, Button } from 'react-native-paper';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';
import { showSuccess, showError } from '../utils/toast';
import { getErrorMessage } from '../utils/errorHandler';

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
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  
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
      showError('Не удалось сохранить настройку');
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
        showError('Имя пользователя должно содержать минимум 3 символа');
        return;
      }
      
      if (trimmedUsername.length > 50) {
        showError('Имя пользователя не может быть длиннее 50 символов');
        return;
      }
      
      // Проверка на допустимые символы
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        showError('Имя пользователя может содержать только буквы, цифры и подчеркивания');
        return;
      }
      
      input.username = trimmedUsername;
    }
    
    if (Object.keys(input).length > 0) {
      updateProfile({ variables: { input } });
    } else {
      showError('Нет изменений для сохранения');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: t('profile.settings'), headerShown: true }} />
      
      {/* Profile Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('settings.profile')}</Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            label={t('auth.username')}
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />
          <Text variant="bodySmall" style={styles.helperText}>
            Только буквы, цифры и подчеркивания (3-50 символов)
          </Text>
          <Button 
            mode="contained" 
            onPress={handleSaveProfile}
            loading={updatingProfile}
            disabled={updatingProfile || username === user?.username}
            style={styles.button}
            contentStyle={{ height: 48 }}
            labelStyle={styles.buttonLabel}
          >
            {t('common.save')}
          </Button>
        </Card.Content>
      </Card>

      {/* Security Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('settings.security')}</Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            label={t('settings.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label={t('settings.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label={t('settings.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <Text variant="bodySmall" style={styles.passwordHint}>
            {t('errors.passwordRequirements')}
          </Text>
          <Button 
            mode="contained" 
            onPress={handleChangePassword}
            loading={changingPassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            style={styles.button}
            contentStyle={{ height: 48 }}
            labelStyle={styles.buttonLabel}
          >
            {t('settings.changePassword')}
          </Button>
        </Card.Content>
      </Card>

      {/* Preferences Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('settings.preferences')}</Text>
      </View>
      
      <Card style={styles.card}>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>{t('settings.wordOfTheDay')}</Text>
            <Text style={styles.settingDescription}>Показывать слово дня на главном экране</Text>
          </View>
          <Switch 
            value={isWordOfDayEnabled} 
            onValueChange={handleWordOfDayToggle} 
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    gap: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.white,
  },
  cardContent: {
    gap: 12,
  },
  input: {
    backgroundColor: Colors.white,
  },
  helperText: {
    color: Colors.textLight,
    marginTop: -8,
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: Colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  passwordHint: {
    color: Colors.textLight,
    marginTop: -4,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    color: Colors.textLight,
    fontSize: 12,
  },
});
