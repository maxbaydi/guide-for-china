import { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Card, Switch, Divider, TextInput, Button } from 'react-native-paper';
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
      displayName
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
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  
  // Update fields when user data loads
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setDisplayName(user.displayName || '');
    }
  }, [user]);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const { refreshUser } = useAuth();

  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_PROFILE, {
    onCompleted: async () => {
      showSuccess(t('settings.profileUpdated'));
      // Обновляем данные пользователя
      await refreshUser();
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    },
    context: {
      skipErrorToast: true, // Обрабатываем ошибки вручную
    },
  });

  const [changePassword, { loading: changingPassword }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      showSuccess(t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    },
    context: {
      skipErrorToast: true,
    },
  });

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
    
    if (displayName !== user?.displayName) {
      const trimmedDisplayName = displayName.trim();
      
      if (trimmedDisplayName.length > 100) {
        showError('Отображаемое имя не может быть длиннее 100 символов');
        return;
      }
      
      input.displayName = trimmedDisplayName || null;
    }
    
    if (Object.keys(input).length > 0) {
      updateProfile({ variables: { input } });
    } else {
      showError('Нет изменений');
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
            helperText="Только буквы, цифры и подчеркивания (3-50 символов)"
          />
          <TextInput
            label={t('auth.displayName')}
            value={displayName}
            onChangeText={setDisplayName}
            mode="outlined"
            style={styles.input}
          />
          <Button 
            mode="contained" 
            onPress={handleSaveProfile}
            loading={updatingProfile}
            disabled={updatingProfile || (username === user?.username && displayName === user?.displayName)}
            style={styles.button}
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
            <Text style={styles.settingLabel}>{t('settings.darkTheme')}</Text>
            <Text style={styles.settingDescription}>{t('common.soon')}</Text>
          </View>
          <Switch value={false} disabled={true} />
        </View>
        <Divider />
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>{t('settings.wordOfTheDay')}</Text>
          </View>
          <Switch 
            value={isNotificationsEnabled} 
            onValueChange={setIsNotificationsEnabled} 
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
  button: {
    marginTop: 8,
    backgroundColor: Colors.primary,
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
