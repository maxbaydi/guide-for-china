import { Definition } from '../types/api.types';
import { stripBKRSTags } from './bkrsParser';

/**
 * Структура раздела словарной статьи (I гл., II сущ., III собств.)
 */
export interface DefinitionSection {
  sectionNumber: string;           // "I", "II", "III", "IV"
  partOfSpeech: string;            // "гл.", "сущ.", "прил./наречие"
  pronunciation?: string;          // основное чтение раздела (например, "shàng")
  pronunciationVariants?: string[]; // альтернативные варианты ["shàng", "shǎng"]
  subsections: DefinitionSubsection[]; // Подразделы (А, Б, В) или пустой массив
  meanings: DefinitionMeaning[];       // Значения без подразделов
}

/**
 * Подраздел внутри раздела (А, Б, В)
 */
export interface DefinitionSubsection {
  label: string;              // "А", "Б", "В" или "гл. А", "сущ. Б"
  meanings: DefinitionMeaning[];
}

/**
 * Отдельное значение внутри раздела или подраздела
 */
export interface DefinitionMeaning {
  number: string;             // "1", "2", "3"
  pronunciation?: string;     // может отличаться: "hǎo", "hào"
  translation: string;        // основной текст перевода
  contextBadges: string[];    // ["знаниями", "кому-л.", "анат.", "перен."]
}

/**
 * Парсит массив определений из базы данных и группирует их по разделам
 */
export function parseDefinitions(definitions: Definition[]): DefinitionSection[] {
  const sections: DefinitionSection[] = [];
  let currentSection: DefinitionSection | null = null;
  let currentSubsection: DefinitionSubsection | null = null;

  // Сортируем по order для правильной последовательности
  const sortedDefs = [...definitions].sort((a, b) => a.order - b.order);

  for (const def of sortedDefs) {
    const text = def.translation.trim();

    // СНАЧАЛА проверяем одиночные римские цифры (они могут попасть под A-Z)
    if (text.match(/^[IVX]+$/)) {
      // Сохраняем предыдущий подраздел если был
      if (currentSubsection && currentSection) {
        currentSection.subsections.push(currentSubsection);
        currentSubsection = null;
      }
      
      // Сохраняем предыдущий раздел
      if (currentSection) {
        sections.push(currentSection);
      }

      // Создаем новый раздел БЕЗ части речи (будет дополнен позже или останется пустым)
      currentSection = {
        sectionNumber: text,
        partOfSpeech: '',
        subsections: [],
        meanings: []
      };
      continue;
    }

    // Распознаем заголовок раздела С ПИНЬИНЬ: "I shàng прил.", "II shàng также shǎng"
    const sectionWithPinyinMatch = text.match(
      /^([IVX]+)\s+([a-züǖǘǚǜāáǎàēéěèīíǐìōóǒòūúǔù]+(?:,?\s+-?[a-züǖǘǚǜāáǎàēéěèīíǐìōóǒòūúǔù]+)*)\s+(.+)$/
    );
    
    if (sectionWithPinyinMatch) {
      // Сохраняем предыдущий подраздел если был
      if (currentSubsection && currentSection) {
        currentSection.subsections.push(currentSubsection);
        currentSubsection = null;
      }
      
      // Сохраняем предыдущий раздел
      if (currentSection) {
        sections.push(currentSection);
      }

      // Извлекаем пиньинь и варианты
      const pinyinPart = sectionWithPinyinMatch[2];
      const variants = pinyinPart.split(/[,\s]+/).filter(p => p.length > 0);

      // Создаем новый раздел с пиньинь
      currentSection = {
        sectionNumber: sectionWithPinyinMatch[1],
        pronunciation: variants[0],
        pronunciationVariants: variants.length > 1 ? variants : undefined,
        partOfSpeech: stripBKRSTags(sectionWithPinyinMatch[3]),
        subsections: [],
        meanings: []
      };
      continue;
    }

    // Распознаем заголовок раздела БЕЗ ПИНЬИНЬ: "I гл.", "II сущ.", "III собств."
    const sectionMatch = text.match(/^([IVX]+)\s+(.+)$/);
    if (sectionMatch) {
      // Сохраняем предыдущий подраздел если был
      if (currentSubsection && currentSection) {
        currentSection.subsections.push(currentSubsection);
        currentSubsection = null;
      }
      
      // Сохраняем предыдущий раздел
      if (currentSection) {
        sections.push(currentSection);
      }

      // Создаем новый раздел без пиньинь
      currentSection = {
        sectionNumber: sectionMatch[1],
        partOfSpeech: stripBKRSTags(sectionMatch[2]),
        subsections: [],
        meanings: []
      };
      continue;
    }

    // Распознаем подзаголовки: "гл. А", "гл. Б" или просто "А", "Б"
    // НО НЕ римские цифры I, V, X (они уже обработаны выше)
    const subsectionMatch = text.match(/^(?:(гл\.|сущ\.|прил\.|нареч\.)\s+)?([А-ЯA-Z])$/);
    if (subsectionMatch) {
      // Сохраняем предыдущий подраздел
      if (currentSubsection && currentSection) {
        currentSection.subsections.push(currentSubsection);
      }
      
      // Создаем новый подраздел
      currentSubsection = {
        label: subsectionMatch[2], // Берем только букву: "А", "Б", "В"
        meanings: []
      };
      continue;
    }

    // Если нет текущего раздела, создаем дефолтный
    if (!currentSection) {
      currentSection = {
        sectionNumber: '',
        partOfSpeech: def.partOfSpeech ? stripBKRSTags(def.partOfSpeech) : '',
        subsections: [],
        meanings: []
      };
    }

    // Распознаем нумерованное значение: "1) ...", "2) ..."
    const meaningMatch = text.match(/^(\d+)\)\s+(.+)$/s);
    if (meaningMatch) {
      const meaningNumber = meaningMatch[1];
      const content = meaningMatch[2];

      // Извлекаем произношение из начала строки (если есть)
      const pinyinMatch = content.match(/^([a-züǖǘǚǜāáǎàēéěèīíǐìōóǒòūúǔù]+)\s+(.+)$/i);

      // Извлекаем контекстные бейджи
      const contextBadges: string[] = [];
      
      if (def.context) {
        const cleanContext = stripBKRSTags(def.context).trim();
        if (cleanContext && cleanContext !== '') {
          contextBadges.push(cleanContext);
        }
      }
      
      if (def.partOfSpeech && def.partOfSpeech !== currentSection.partOfSpeech) {
        const cleanPartOfSpeech = stripBKRSTags(def.partOfSpeech).trim();
        if (cleanPartOfSpeech && cleanPartOfSpeech !== '') {
          contextBadges.push(cleanPartOfSpeech);
        }
      }

      const meaning = {
        number: meaningNumber,
        pronunciation: pinyinMatch ? pinyinMatch[1] : undefined,
        translation: pinyinMatch ? pinyinMatch[2] : content,
        contextBadges: contextBadges
      };

      // Добавляем в подраздел или в основной раздел
      if (currentSubsection) {
        currentSubsection.meanings.push(meaning);
      } else {
        currentSection.meanings.push(meaning);
      }
    } else {
      // Это определение без номера - добавляем как есть
      const contextBadges: string[] = [];
      
      if (def.context) {
        const cleanContext = stripBKRSTags(def.context).trim();
        if (cleanContext && cleanContext !== '') {
          contextBadges.push(cleanContext);
        }
      }
      
      if (def.partOfSpeech && def.partOfSpeech !== currentSection.partOfSpeech) {
        const cleanPartOfSpeech = stripBKRSTags(def.partOfSpeech).trim();
        if (cleanPartOfSpeech && cleanPartOfSpeech !== '') {
          contextBadges.push(cleanPartOfSpeech);
        }
      }

      const meaning = {
        number: '',
        translation: text,
        contextBadges: contextBadges
      };

      // Добавляем в подраздел или в основной раздел
      if (currentSubsection) {
        currentSubsection.meanings.push(meaning);
      } else {
        currentSection.meanings.push(meaning);
      }
    }
  }

  // Сохраняем последний подраздел если был
  if (currentSubsection && currentSection) {
    currentSection.subsections.push(currentSubsection);
  }

  // Сохраняем последний раздел
  if (currentSection && (currentSection.meanings.length > 0 || currentSection.subsections.length > 0)) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Извлекает первый реальный перевод из определений (не заголовок раздела)
 * Используется для превью карточек
 */
export function getFirstTranslation(definitions: Definition[]): string {
  if (!definitions || definitions.length === 0) {
    return '';
  }

  const sections = parseDefinitions(definitions);
  
  // Ищем первое значение с переводом
  for (const section of sections) {
    // Проверяем значения без подразделов
    for (const meaning of section.meanings) {
      if (meaning.translation && meaning.translation.trim() !== '') {
        return stripBKRSTags(meaning.translation);
      }
    }
    
    // Проверяем значения в подразделах
    for (const subsection of section.subsections) {
      for (const meaning of subsection.meanings) {
        if (meaning.translation && meaning.translation.trim() !== '') {
          return stripBKRSTags(meaning.translation);
        }
      }
    }
  }

  // Fallback - ищем первое РЕАЛЬНОЕ определение (не заголовок, не подзаголовок)
  // Пропускаем заголовки разделов (I, II, III), части речи и подзаголовки (гл. А, Б)
  for (const def of definitions) {
    const text = def.translation.trim();
    
    // Пропускаем одиночные римские цифры
    if (text.match(/^[IVX]+$/)) {
      continue;
    }
    
    // Пропускаем заголовки разделов (с пиньинь или без)
    // "I shàng прил.", "II гл.", но НЕ "1) ..."
    if (text.match(/^[IVX]+\s+[a-züǖǘǚǜāáǎàēéěèīíǐìōóǒòūúǔù]/)) {
      continue;
    }
    if (text.match(/^[IVX]+\s+(гл\.|сущ\.|прил\.|нареч\.|собств\.|союз|междом\.|счётн\.|служебное)/)) {
      continue;
    }
    
    // Пропускаем подзаголовки: "гл. А", "А", "Б"
    if (text.match(/^(?:(гл\.|сущ\.|прил\.|нареч\.)\s+)?[А-ЯA-Z]$/)) {
      continue;
    }
    
    // Это реальное определение - возвращаем его
    if (text.length > 0) {
      return stripBKRSTags(text);
    }
  }

  return '';
}

/**
 * Определяет, является ли текст отдельным словом/иероглифом или фразой
 * @param text - китайский текст
 * @returns true если это короткое слово (≤4 символа), false если длинная фраза
 */
export function isShortWord(text: string): boolean {
  if (!text) return true;
  const trimmed = text.trim();
  return trimmed.length <= 3;
}

/**
 * Проверяет, меняется ли произношение внутри раздела
 */
export function hasPronunciationVariations(section: DefinitionSection): boolean {
  const pronunciations = section.meanings
    .map(m => m.pronunciation)
    .filter((p): p is string => !!p);
  
  if (pronunciations.length <= 1) return false;
  
  const first = pronunciations[0];
  return pronunciations.some(p => p !== first);
}

