import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, StyleSheet, Text, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { api } from '../../services/api';
import { CharacterAnalysis } from '../../types/api.types';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Colors';
import { CustomButton } from '../../components/ui/Button';
import { showError } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';

const MAX_TEXT_LENGTH = 300;

export default function AnalyzeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, shadows } = useTheme();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.get<CharacterAnalysis[]>('/dictionary/analyze', { 
        params: { text },
      });
      return data;
    },
    onSuccess: (data) => {
      router.push({
        pathname: '/analyze/results',
        params: { 
          results: JSON.stringify(data),
          originalText: text.trim(),
        },
      });
    },
    onError: (error: any) => {
      console.error('Analysis failed:', error);
      const message = getErrorMessage(error);
      showError(message, t('errors.analysisFailed'));
    },
  });

  const handleAnalyze = () => {
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      return;
    }
    
    if (trimmedText.length > MAX_TEXT_LENGTH) {
      showError(t('errors.textTooLong', { max: MAX_TEXT_LENGTH }));
      return;
    }
    
    analyzeMutation.mutate(trimmedText);
  };

  const handleTextChange = (newText: string) => {
    // Разрешаем ввод, но не даем превысить лимит
    if (newText.length <= MAX_TEXT_LENGTH) {
      setText(newText);
    }
  };

  const handlePaste = async () => {
    const pastedText = await Clipboard.getStringAsync();
    setText(pastedText);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('analyze.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('analyze.subtitle')}
          </Text>
        </View>

        <RNTextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder={t('analyze.placeholder') || '我爱学中文...'}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.textInput,
            {
              backgroundColor: theme.surface,
              borderColor: isFocused ? theme.primary : theme.border,
              borderWidth: isFocused ? 2 : 1,
              color: theme.text,
              ...shadows.small,
            }
          ]}
          maxLength={MAX_TEXT_LENGTH}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <Text 
          style={[
            styles.characterCount,
            { color: text.length >= MAX_TEXT_LENGTH ? theme.secondary : theme.textSecondary }
          ]}
        >
          {t('analyze.characterCount', { count: text.length, max: MAX_TEXT_LENGTH })}
        </Text>

        <View style={styles.buttonRow}>
          <CustomButton 
            variant="outlined"
            onPress={handlePaste}
            style={styles.secondaryButton}
          >
            {t('analyze.pasteButton')}
          </CustomButton>
          <CustomButton 
            variant="outlined"
            onPress={handleClear}
            disabled={!text}
            style={styles.secondaryButton}
          >
            {t('analyze.clearButton')}
          </CustomButton>
        </View>
        
        <CustomButton
          variant="primary"
          onPress={handleAnalyze}
          loading={analyzeMutation.isPending}
          disabled={!text.trim() || analyzeMutation.isPending || text.length > MAX_TEXT_LENGTH}
          style={styles.analyzeButton}
        >
          {t('analyze.analyzeButton')}
        </CustomButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 120,
    gap: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  textInput: {
    minHeight: 200,
    maxHeight: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 17,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  characterCount: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: -Spacing.lg,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  secondaryButton: {
    flex: 1,
  },
  analyzeButton: {
    width: '100%',
  },
});
