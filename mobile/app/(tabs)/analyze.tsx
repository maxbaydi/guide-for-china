import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Text, TextInput, Button } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { api } from '../../services/api';
import { CharacterAnalysis } from '../../types/api.types';
import { Colors } from '../../constants/Colors';
import { showError } from '../../utils/toast';
import { getErrorMessage } from '../../utils/errorHandler';

const MAX_TEXT_LENGTH = 300;

export default function AnalyzeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [text, setText] = useState('');

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
      style={styles.container}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            {t('analyze.title')}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {t('analyze.subtitle')}
          </Text>
        </View>

        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder={t('analyze.placeholder') || '我爱学中文...'}
          multiline
          style={styles.textInput}
          maxLength={MAX_TEXT_LENGTH}
        />

        <Text 
          variant="bodySmall" 
          style={[
            styles.characterCount,
            text.length >= MAX_TEXT_LENGTH && styles.characterCountLimit
          ]}
        >
          {t('analyze.characterCount', { count: text.length, max: MAX_TEXT_LENGTH })}
        </Text>

        <View style={styles.buttonRow}>
          <Button 
            mode="elevated" 
            onPress={handlePaste} 
            style={styles.secondaryButton} 
            labelStyle={styles.secondaryButtonText}
          >
            {t('analyze.pasteButton')}
          </Button>
          <Button 
            mode="elevated" 
            onPress={handleClear} 
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonText}
            disabled={!text}
          >
            {t('analyze.clearButton')}
          </Button>
        </View>
        
        <Button
          mode="contained"
          onPress={handleAnalyze}
          loading={analyzeMutation.isPending}
          disabled={!text.trim() || analyzeMutation.isPending || text.length > MAX_TEXT_LENGTH}
          style={styles.analyzeButton}
          labelStyle={styles.analyzeButtonLabel}
        >
          {t('analyze.analyzeButton')}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
    gap: 24,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textLight,
  },
  textInput: {
    minHeight: 200,
    maxHeight: 400,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: -16,
  },
  characterCountLimit: {
    color: Colors.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(229, 231, 235, 0.8)',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontWeight: '600',
    paddingVertical: 8,
  },
  analyzeButton: {
    paddingVertical: 8,
    backgroundColor: Colors.primary,
  },
  analyzeButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
