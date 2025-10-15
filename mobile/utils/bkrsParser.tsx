import React from 'react';
import { Text } from 'react-native-paper';
import { Colors } from '../constants/Colors';

/**
 * Парсит теги форматирования BKRS и возвращает React элементы
 * Поддерживаемые теги:
 * [i]...[/i] - курсив (italic)
 * [p]...[/p] - пометка (метка), например "гл.", "уст."
 * [b]...[/b] - жирный текст (bold)
 * [c]...[/c] - контекст (context)
 */

interface ParsedSegment {
  text: string;
  style?: 'italic' | 'bold' | 'label' | 'context';
}

export function parseBKRSTags(text: string): ParsedSegment[] {
  if (!text) return [];

  const segments: ParsedSegment[] = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    // Проверяем начало тега
    if (text[i] === '[') {
      // Сохраняем накопленный текст
      if (currentText) {
        segments.push({ text: currentText });
        currentText = '';
      }

      // Определяем тип тега
      if (text.substr(i, 3) === '[i]') {
        const closeTag = text.indexOf('[/i]', i);
        if (closeTag !== -1) {
          const content = text.substring(i + 3, closeTag);
          segments.push({ text: content, style: 'italic' });
          i = closeTag + 4;
          continue;
        }
      } else if (text.substr(i, 3) === '[p]') {
        const closeTag = text.indexOf('[/p]', i);
        if (closeTag !== -1) {
          const content = text.substring(i + 3, closeTag);
          segments.push({ text: content, style: 'label' });
          i = closeTag + 4;
          continue;
        }
      } else if (text.substr(i, 3) === '[b]') {
        const closeTag = text.indexOf('[/b]', i);
        if (closeTag !== -1) {
          const content = text.substring(i + 3, closeTag);
          segments.push({ text: content, style: 'bold' });
          i = closeTag + 4;
          continue;
        }
      } else if (text.substr(i, 3) === '[c]') {
        const closeTag = text.indexOf('[/c]', i);
        if (closeTag !== -1) {
          const content = text.substring(i + 3, closeTag);
          segments.push({ text: content, style: 'context' });
          i = closeTag + 4;
          continue;
        }
      }
    }

    currentText += text[i];
    i++;
  }

  // Добавляем оставшийся текст
  if (currentText) {
    segments.push({ text: currentText });
  }

  return segments;
}

/**
 * Рендерит распарсенные сегменты в React компоненты
 */
export function renderBKRSText(text: string, baseStyle?: any): React.ReactNode {
  const segments = parseBKRSTags(text);

  return segments.map((segment, index) => {
    const style = { ...baseStyle };

    switch (segment.style) {
      case 'italic':
        style.fontStyle = 'italic';
        style.color = Colors.textLight;
        break;
      case 'bold':
        style.fontWeight = 'bold';
        break;
      case 'label':
        style.color = Colors.secondary;
        style.fontSize = style.fontSize ? style.fontSize * 0.9 : 13;
        break;
      case 'context':
        style.color = '#8b5cf6'; // Фиолетовый для контекста
        style.fontStyle = 'italic';
        break;
    }

    return (
      <Text key={index} style={style}>
        {segment.text}
      </Text>
    );
  });
}

/**
 * Упрощенная версия - возвращает текст без тегов
 */
export function stripBKRSTags(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\[i\]/g, '')
    .replace(/\[\/i\]/g, '')
    .replace(/\[p\]/g, '')
    .replace(/\[\/p\]/g, '')
    .replace(/\[b\]/g, '')
    .replace(/\[\/b\]/g, '')
    .replace(/\[c\]/g, '')
    .replace(/\[\/c\]/g, '')
    .trim();
}

