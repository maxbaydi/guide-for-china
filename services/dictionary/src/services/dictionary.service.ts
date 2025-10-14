import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Character } from '../entities/character.entity';
import { Phrase } from '../entities/phrase.entity';
import { CharacterAnalysis } from '../entities/character-analysis.entity';

@Injectable()
export class DictionaryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Поиск иероглифов с использованием полнотекстового поиска pg_jieba
   */
  async searchCharacters(query: string, limit: number = 20): Promise<Character[]> {
    const results = await this.prisma.$queryRaw<Character[]>`
      SELECT * FROM search_chinese_characters(${query}, ${limit}::int)
    `;
    
    // Для каждого иероглифа загружаем связанные данные
    return Promise.all(
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
  }

  /**
   * Получить иероглиф по ID
   */
  async getCharacter(id: string): Promise<Character | null> {
    const character = await this.prisma.character.findUnique({
      where: { id },
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
    
    return phrases as Phrase[];
  }

  /**
   * Анализ текста - разбивает текст на иероглифы и возвращает информацию о каждом
   */
  async analyzeText(text: string): Promise<CharacterAnalysis[]> {
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
    // Используем текущую дату как seed
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    // Получаем случайный иероглиф с HSK уровнем 1-3 (для начинающих)
    const characters = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM chinese_characters 
      WHERE hsk_level BETWEEN 1 AND 3
      ORDER BY md5(simplified || ${seed}::text)
      LIMIT 1
    `;
    
    if (!characters || characters.length === 0) return null;
    
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
    
    return character as Character;
  }
}

