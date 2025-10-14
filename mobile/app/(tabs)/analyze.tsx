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
      const message = error?.response?.data?.message || t('errors.analysisFailed');
      console.error('Analysis failed:', message);
      // Toast/Snackbar можно добавить позже
    },
  });

  const handleAnalyze = () => {
    if (text.trim()) {
      analyzeMutation.mutate(text.trim());
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
          onChangeText={setText}
          placeholder={t('analyze.placeholder') || '我爱学中文...'}
          multiline
          style={styles.textInput}
        />

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
          disabled={!text.trim() || analyzeMutation.isPending}
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
