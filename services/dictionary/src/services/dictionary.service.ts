import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from '../redis/redis.service';
import { Character } from '../entities/character.entity';
import { Phrase } from '../entities/phrase.entity';
import { CharacterAnalysis } from '../entities/character-analysis.entity';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Поиск иероглифов с использованием полнотекстового поиска pg_jieba
   */
  async searchCharacters(query: string, limit: number = 20): Promise<Character[]> {
    // Проверяем кеш
    const cached = await this.redisService.getCachedSearchResults(`${query}:${limit}`);
    if (cached) {
      this.logger.log(`Cache hit for search: ${query}`);
      return cached;
    }

    this.logger.log(`Cache miss for search: ${query}, querying database`);
    const results = await this.prisma.$queryRaw<Character[]>`
      SELECT * FROM search_chinese_characters(${query}, ${limit}::int)
    `;
    
    // Для каждого иероглифа загружаем связанные данные
    const characters = await Promise.all(
      results.map(async (char) => {
        const character = await this.prisma.character.findUnique({
          where: { id: char.id },
          include: {
            definitions: {
              orderBy: { order: 'asc' },
            },
            examples: true,
          },
        });
        
        return character as Character;
      }),
    );

    // Кешируем результат на 5 минут (300 секунд)
    await this.redisService.cacheSearchResults(`${query}:${limit}`, characters, 300);
    
    return characters;
  }

  /**
   * Получить иероглиф по ID
   */
  async getCharacter(id: string): Promise<Character | null> {
    // Проверяем кеш
    const cached = await this.redisService.getCachedCharacter(id);
    if (cached) {
      this.logger.log(`Cache hit for character: ${id}`);
      return cached;
    }

    this.logger.log(`Cache miss for character: ${id}, querying database`);
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: {
        definitions: {
          orderBy: { order: 'asc' },
        },
        examples: true,
      },
    });
    
    if (character) {
      // Кешируем результат на 1 час (3600 секунд)
      await this.redisService.cacheCharacter(id, character, 3600);
    }
    
    return character as Character;
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
        },
        examples: true,
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
    const analysis: CharacterAnalysis[] = [];

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      
      // Проверяем, является ли это китайским иероглифом
      if (this.isChineseCharacter(char)) {
        const details = await this.getCharacterBySimplified(char);
        
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
          },
          examples: true,
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
        },
        examples: true,
      },
    });
    
    if (character) {
      // Кешируем слово дня на 24 часа (86400 секунд)
      await this.redisService.cacheWordOfTheDay(character, 86400);
    }
    
    return character as Character;
  }
}

