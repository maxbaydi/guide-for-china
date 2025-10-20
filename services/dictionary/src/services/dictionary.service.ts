import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService } from './search.service';
import { Character } from '../entities/character.entity';
import { Phrase } from '../entities/phrase.entity';
import { CharacterAnalysis } from '../entities/character-analysis.entity';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private searchService: SearchService,
  ) {}

  /**
   * Поиск иероглифов с использованием улучшенного алгоритма поиска
   * Автоматически определяет тип ввода (китайский/пиньин/русский)
   * и применяет соответствующую стратегию поиска
   * 
   * ОПТИМИЗИРОВАНО: Использует search_enhanced_v2 с агрегированными definitions,
   * без загрузки examples (lazy loading)
   */
  async searchCharacters(query: string, limit: number = 20): Promise<Character[]> {
    // Проверяем кеш с новой версией ключа
    const cacheKey = `search:v2:${query}:${limit}`;
    const cached = await this.redisService.getCachedSearchResults(cacheKey);
    if (cached) {
      this.logger.log(`✅ Cache hit for search: ${query}`);
      return cached;
    }

    this.logger.log(`❌ Cache miss for search: ${query}, querying database`);
    const startTime = Date.now();
    
    // Используем ОПТИМИЗИРОВАННЫЙ поиск - одним запросом получаем все данные
    const inputType = this.detectInputType(query);
    const normalizedQuery = this.normalizeQuery(query, inputType);
    const searchResults = await this.searchService.executeSearchOptimized(
      normalizedQuery,
      inputType,
      limit,
    );
    
    if (searchResults.length === 0) {
      this.logger.log(`No results found for query: ${query}`);
      return [];
    }
    
    // Преобразуем результаты в формат Character
    // Теперь НЕТ N+1 проблемы - все данные уже загружены одним запросом!
    const characters = searchResults.map((result) => ({
      id: result.id,
      simplified: result.simplified,
      traditional: result.traditional,
      pinyin: result.pinyin,
      hskLevel: result.hsk_level,
      frequency: result.frequency,
      definitions: result.definitions || [], // Уже загружены из БД
      examples: [], // НЕ загружаем - используем lazy loading
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Character));

    const duration = Date.now() - startTime;
    this.logger.log(
      `🚀 Search completed in ${duration}ms: "${query}" (${characters.length} results)`,
    );

    // Кешируем результат на 30 минут (1800 секунд) вместо 5
    await this.redisService.cacheSearchResults(cacheKey, characters, 1800);
    
    return characters;
  }

  /**
   * Вспомогательная функция для определения типа ввода
   */
  private detectInputType(query: string): any {
    // Импортируем из utils
    const { detectInputType } = require('../utils/input-detector');
    return detectInputType(query);
  }

  /**
   * Вспомогательная функция для нормализации запроса
   */
  private normalizeQuery(query: string, inputType: any): string {
    const {
      normalizeQuery,
      normalizePinyin,
      normalizeRussian,
      normalizeChinese,
    } = require('../utils/text-normalizer');
    
    switch (inputType) {
      case 'CHINESE':
        return normalizeChinese(query);
      case 'PINYIN':
        return normalizePinyin(query);
      case 'RUSSIAN':
        return normalizeRussian(query);
      default:
        return normalizeQuery(query);
    }
  }

  /**
   * Получить иероглиф по ID
   * ОПТИМИЗИРОВАНО: Загружаем только базовую информацию и definitions
   * Examples загружаются отдельно через getCharacterExamples()
   */
  async getCharacter(id: string): Promise<Character | null> {
    // Проверяем кеш
    const cached = await this.redisService.getCachedCharacter(id);
    if (cached) {
      this.logger.log(`✅ Cache hit for character: ${id}`);
      return cached;
    }

    this.logger.log(`❌ Cache miss for character: ${id}, querying database`);
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: {
        definitions: {
          orderBy: { order: 'asc' },
          take: 20, // Ограничиваем до 20 определений
        },
        // НЕ загружаем examples - используем lazy loading
      },
    });
    
    if (character) {
      this.logger.log(`Character found: ${character.simplified} (${character.id})`);
      
      // Добавляем пустой массив examples для совместимости
      const characterWithEmptyExamples = {
        ...character,
        examples: [],
      };
      
      // Кешируем результат на 1 час (3600 секунд)
      await this.redisService.cacheCharacter(id, characterWithEmptyExamples, 3600);
      
      return characterWithEmptyExamples as Character;
    } else {
      this.logger.warn(`Character not found with id: ${id}`);
    }
    
    return null;
  }

  /**
   * Загрузить примеры для иероглифа (lazy loading)
   * Вызывается отдельно, только когда пользователь открывает детали иероглифа
   */
  async getCharacterExamples(characterId: string, limit: number = 20): Promise<any[]> {
    // Проверяем кеш примеров
    const cacheKey = `examples:${characterId}:${limit}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`✅ Cache hit for examples: ${characterId}`);
      return JSON.parse(cached);
    }

    this.logger.log(`❌ Cache miss for examples: ${characterId}, querying database`);
    
    // Используем оптимизированную функцию из миграции 008
    const examples = await this.searchService.getCharacterExamples(characterId, limit);
    
    // Кешируем примеры на 1 час
    await this.redisService.set(cacheKey, JSON.stringify(examples), 3600);
    
    return examples;
  }

  /**
   * Получить иероглиф по упрощенному написанию
   */
  async getCharacterBySimplified(simplified: string): Promise<Character | null> {
    const character = await this.prisma.character.findFirst({
      where: { simplified },
      include: {
        definitions: {
          orderBy: { order: 'asc' },
          take: 20, // Ограничиваем до 20 определений
        },
        examples: {
          take: 20, // Ограничиваем до 20 примеров
          orderBy: {
            createdAt: 'desc', // Сортируем для детерминированного порядка
          },
        },
      },
    });
    
    return character as Character;
  }

  /**
   * Поиск фраз по русскому или китайскому тексту
   */
  async searchPhrases(query: string, limit: number = 20): Promise<Phrase[]> {
    // Проверяем кеш
    const cached = await this.redisService.getCachedPhraseSearchResults(`${query}:${limit}`);
    if (cached) {
      this.logger.log(`Cache hit for phrase search: ${query}`);
      return cached;
    }

    this.logger.log(`Cache miss for phrase search: ${query}, querying database`);
    const phrases = await this.prisma.phrase.findMany({
      where: {
        OR: [
          { russian: { contains: query, mode: 'insensitive' } },
          { chinese: { contains: query } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    
    // Кешируем результат на 5 минут (300 секунд)
    await this.redisService.cachePhraseSearchResults(`${query}:${limit}`, phrases, 300);
    
    return phrases as Phrase[];
  }

  /**
   * Анализ текста - разбивает текст на иероглифы и возвращает информацию о каждом
   * Оптимизирован для избежания N+1 запросов к базе данных
   */
  async analyzeText(text: string): Promise<CharacterAnalysis[]> {
    // Проверяем кеш
    const cached = await this.redisService.getCachedAnalysisResults(text);
    if (cached) {
      this.logger.log(`Cache hit for text analysis: ${text.substring(0, 20)}...`);
      return cached;
    }

    this.logger.log(`Cache miss for text analysis, processing: ${text.substring(0, 20)}...`);
    const characters = text.split('');
    
    // Шаг 1: Собрать все уникальные китайские иероглифы из текста
    const uniqueChineseChars = new Set<string>();
    for (const char of characters) {
      if (this.isChineseCharacter(char)) {
        uniqueChineseChars.add(char);
      }
    }

    // Шаг 2: Выполнить один массовый запрос для всех уникальных иероглифов
    // Не загружаем examples для оптимизации производительности - они не нужны в UI анализа
    const uniqueCharsArray = Array.from(uniqueChineseChars);
    this.logger.log(`Fetching ${uniqueCharsArray.length} unique characters from database`);
    
    const characterRecords = await this.prisma.character.findMany({
      where: {
        simplified: {
          in: uniqueCharsArray,
        },
      },
      include: {
        definitions: {
          orderBy: { order: 'asc' },
          take: 20, // Ограничиваем до 20 определений
        },
      },
    });

    // Шаг 3: Создать Map для быстрого доступа O(1)
    const characterMap = new Map<string, Character>();
    for (const char of characterRecords) {
      // Добавляем пустой массив examples, так как мы их не загружали для оптимизации
      characterMap.set(char.simplified, { ...char, examples: [] } as Character);
    }

    // Шаг 4: Построить результат используя Map
    const analysis: CharacterAnalysis[] = [];
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      
      if (this.isChineseCharacter(char)) {
        const details = characterMap.get(char);
        
        analysis.push({
          character: char,
          details: details || undefined,
          position: i,
        });
      }
    }

    // Кешируем результат на 30 минут (1800 секунд)
    await this.redisService.cacheAnalysisResults(text, analysis, 1800);

    return analysis;
  }

  /**
   * Проверка, является ли символ китайским иероглифом
   */
  private isChineseCharacter(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x4e00 && code <= 0x9fff) || // Основные иероглифы
      (code >= 0x3400 && code <= 0x4dbf) || // Расширение A
      (code >= 0x20000 && code <= 0x2a6df) || // Расширение B
      (code >= 0x2a700 && code <= 0x2b73f) || // Расширение C
      (code >= 0x2b740 && code <= 0x2b81f) || // Расширение D
      (code >= 0x2b820 && code <= 0x2ceaf) // Расширение E
    );
  }

  /**
   * Получить статистику словаря
   */
  async getStatistics() {
    const [characterCount, definitionCount, exampleCount, phraseCount] = await Promise.all([
      this.prisma.character.count(),
      this.prisma.definition.count(),
      this.prisma.example.count(),
      this.prisma.phrase.count(),
    ]);

    return {
      characters: characterCount,
      definitions: definitionCount,
      examples: exampleCount,
      phrases: phraseCount,
    };
  }

  /**
   * Получить похожие слова
   * Поиск слов начинающихся с данного иероглифа или содержащих его
   */
  async getSimilarWords(simplified: string, limit: number = 20): Promise<any[]> {
    try {
      // Поиск слов начинающихся с иероглифа или содержащих его
      const similarChars = await this.prisma.character.findMany({
        where: {
          OR: [
            { simplified: { startsWith: simplified } },
            { simplified: { contains: simplified } },
          ],
          NOT: {
            simplified: simplified, // Исключаем сам иероглиф
          },
        },
        include: {
          definitions: {
            orderBy: { order: 'asc' },
            take: 1, // Берем только первое определение для предпросмотра
          },
        },
        take: limit,
        orderBy: [
          // Сначала слова начинающиеся с иероглифа
          { simplified: 'asc' },
        ],
      });

      // Преобразуем в формат с mainTranslation
      return similarChars.map((char) => ({
        id: char.id,
        simplified: char.simplified,
        pinyin: char.pinyin || '',
        mainTranslation: char.definitions[0]?.translation || 'Нет перевода',
      }));
    } catch (error) {
      this.logger.error(`Error fetching similar words for ${simplified}:`, error);
      return [];
    }
  }

  /**
   * Получить обратные переводы
   * Поиск в таблице phrases, где встречается данный иероглиф
   */
  async getReverseTranslations(simplified: string, limit: number = 20): Promise<any[]> {
    try {
      const phrases = await this.prisma.phrase.findMany({
        where: {
          chinese: {
            contains: simplified,
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return phrases.map((phrase) => ({
        russian: phrase.russian,
        chinese: phrase.chinese,
        pinyin: phrase.pinyin,
      }));
    } catch (error) {
      this.logger.error(`Error fetching reverse translations for ${simplified}:`, error);
      return [];
    }
  }

  /**
   * Получить слово дня
   * Использует дату как seed для детерминированного выбора
   */
  async getWordOfTheDay(): Promise<Character | null> {
    // Проверяем кеш
    const cached = await this.redisService.getCachedWordOfTheDay();
    if (cached) {
      this.logger.log('Cache hit for word of the day');
      return cached;
    }

    this.logger.log('Cache miss for word of the day, generating new one');
    // Используем текущую дату как seed
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    // Получаем случайный иероглиф детерминированно на основе даты
    // Используем иероглифы с определениями и примерами для лучшего опыта обучения
    const characters = await this.prisma.$queryRaw<any[]>`
      SELECT c.id, c.simplified, c.traditional, c.pinyin, c."hskLevel", c.frequency, c."createdAt", c."updatedAt"
      FROM characters c
      INNER JOIN definitions d ON c.id = d."characterId"
      WHERE d.translation IS NOT NULL
        AND LENGTH(c.simplified) = 1
      ORDER BY md5(c.simplified || ${seed}::text)
      LIMIT 1
    `;
    
    if (!characters || characters.length === 0) {
      // Fallback: просто любой иероглиф
      this.logger.warn('No characters with definitions found, using fallback');
      const fallback = await this.prisma.character.findFirst({
        where: {
          definitions: {
            some: {},
          },
        },
        include: {
          definitions: {
            orderBy: { order: 'asc' },
            take: 20, // Ограничиваем до 20 определений
          },
          examples: {
            take: 20, // Ограничиваем до 20 примеров
            orderBy: {
              createdAt: 'desc', // Сортируем для детерминированного порядка
            },
          },
        },
      });
      return fallback as Character;
    }
    
    // Загружаем полную информацию об иероглифе
    const character = await this.prisma.character.findUnique({
      where: { id: characters[0].id },
      include: {
        definitions: {
          orderBy: { order: 'asc' },
          take: 20, // Ограничиваем до 20 определений
        },
        examples: {
          take: 20, // Ограничиваем до 20 примеров
          orderBy: {
            createdAt: 'desc', // Сортируем для детерминированного порядка
          },
        },
      },
    });
    
    if (character) {
      // Кешируем слово дня на 24 часа (86400 секунд)
      await this.redisService.cacheWordOfTheDay(character, 86400);
    }
    
    return character as Character;
  }
}

