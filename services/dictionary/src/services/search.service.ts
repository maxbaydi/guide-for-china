import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  detectInputType,
  InputType,
} from '../utils/input-detector';
import {
  normalizeQuery,
  normalizePinyin,
  normalizeRussian,
  normalizeChinese,
} from '../utils/text-normalizer';

/**
 * Интерфейс для результатов поиска из БД
 */
export interface SearchResult {
  id: string;
  simplified: string;
  traditional: string | null;
  pinyin: string | null;
  hsk_level: number | null;
  frequency: number | null;
  match_score: number;
  match_type: 'exact' | 'prefix' | 'fuzzy';
}

/**
 * Сервис для улучшенного поиска с детекцией типа ввода,
 * нормализацией запросов и умным ранжированием
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Основной метод поиска с автоматической детекцией типа ввода
   * и применением соответствующей стратегии поиска
   * 
   * @param query - поисковый запрос от пользователя
   * @param limit - максимальное количество результатов
   * @returns массив результатов поиска с расширенной информацией
   */
  async searchWithStrategy(
    query: string,
    limit: number = 20,
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      this.logger.warn('Empty search query received');
      return [];
    }

    // Шаг 1: Определяем тип ввода
    const inputType = detectInputType(query);
    this.logger.log(`Detected input type: ${inputType} for query: "${query}"`);

    // Шаг 2: Нормализуем запрос в соответствии с типом
    const normalizedQuery = this.normalizeQuery(query, inputType);
    this.logger.log(`Normalized query: "${normalizedQuery}"`);

    // Шаг 3: Выполняем поиск в БД с использованием новой функции
    const results = await this.executeSearch(
      normalizedQuery,
      inputType,
      limit,
    );

    this.logger.log(
      `Found ${results.length} results for query "${query}" (type: ${inputType})`,
    );

    // Шаг 4: Применяем финальное ранжирование на уровне приложения
    const rankedResults = this.applyFinalRanking(results);

    return rankedResults.slice(0, limit);
  }

  /**
   * Нормализует запрос в зависимости от типа ввода
   * 
   * @param query - исходный запрос
   * @param inputType - определенный тип ввода
   * @returns нормализованный запрос
   */
  private normalizeQuery(query: string, inputType: InputType): string {
    switch (inputType) {
      case InputType.CHINESE:
        return normalizeChinese(query);
      case InputType.PINYIN:
        return normalizePinyin(query);
      case InputType.RUSSIAN:
        return normalizeRussian(query);
      case InputType.MIXED:
        // Для смешанного типа применяем универсальную нормализацию
        return normalizeQuery(query);
      default:
        return query.trim();
    }
  }

  /**
   * Выполняет поиск в БД используя функцию search_enhanced
   * 
   * @param normalizedQuery - нормализованный запрос
   * @param inputType - тип ввода
   * @param limit - лимит результатов
   * @returns результаты из БД
   */
  private async executeSearch(
    normalizedQuery: string,
    inputType: InputType,
    limit: number,
  ): Promise<SearchResult[]> {
    try {
      // Преобразуем InputType в строку для PostgreSQL
      const queryType = this.mapInputTypeToQueryType(inputType);

      // Вызываем функцию search_enhanced из миграции 007
      const results = await this.prisma.$queryRaw<SearchResult[]>`
        SELECT * FROM search_enhanced(
          ${normalizedQuery}::text,
          ${queryType}::text,
          ${limit}::integer
        )
      `;

      return results || [];
    } catch (error) {
      this.logger.error(
        `Search execution failed for query "${normalizedQuery}":`,
        error,
      );
      // В случае ошибки возвращаем пустой массив
      return [];
    }
  }

  /**
   * Преобразует InputType в строковый тип для PostgreSQL функции
   * 
   * @param inputType - тип ввода из enum
   * @returns строковое представление для SQL
   */
  private mapInputTypeToQueryType(inputType: InputType): string {
    switch (inputType) {
      case InputType.CHINESE:
        return 'chinese';
      case InputType.PINYIN:
        return 'pinyin';
      case InputType.RUSSIAN:
        return 'russian';
      case InputType.MIXED:
        return 'mixed';
      default:
        return 'mixed';
    }
  }

  /**
   * Применяет финальное ранжирование результатов на уровне приложения
   * Учитывает:
   * - Тип совпадения (exact > prefix > fuzzy)
   * - Match score из БД
   * - Частотность слова (frequency)
   * - Уровень HSK (базовые слова приоритетнее)
   * 
   * @param results - результаты из БД
   * @returns отсортированный массив результатов
   */
  private applyFinalRanking(results: SearchResult[]): SearchResult[] {
    return results
      .map((result) => ({
        ...result,
        finalScore: this.calculateFinalScore(result),
      }))
      .sort((a, b) => {
        // Сначала сортируем по финальному скору
        if (b.finalScore !== a.finalScore) {
          return b.finalScore - a.finalScore;
        }

        // При равном скоре - по типу совпадения
        const typeOrder = { exact: 1, prefix: 2, fuzzy: 3 };
        const typeCompare = typeOrder[a.match_type] - typeOrder[b.match_type];
        if (typeCompare !== 0) {
          return typeCompare;
        }

        // При равном типе - по частотности (меньше = популярнее)
        const aFreq = a.frequency ?? 999999;
        const bFreq = b.frequency ?? 999999;
        if (aFreq !== bFreq) {
          return aFreq - bFreq;
        }

        // В последнюю очередь - алфавитный порядок
        return a.simplified.localeCompare(b.simplified);
      });
  }

  /**
   * Вычисляет финальный скор для результата поиска
   * 
   * @param result - результат поиска
   * @returns числовой скор для ранжирования
   */
  private calculateFinalScore(result: SearchResult): number {
    // Базовые веса для типов совпадения
    const matchTypeWeights = {
      exact: 1.0,
      prefix: 0.8,
      fuzzy: 0.5,
    };

    // Начальный скор на основе типа и score из БД
    let score = result.match_score * matchTypeWeights[result.match_type];

    // Бонус за частотность (популярные слова выше)
    // Чем меньше frequency rank, тем популярнее слово
    if (result.frequency !== null && result.frequency > 0) {
      // Нормализуем частотность: слова с rank < 1000 получают бонус
      const frequencyBonus = Math.max(0, 1 - result.frequency / 10000) * 0.2;
      score += frequencyBonus;
    }

    // Бонус за базовый уровень HSK (1-3 уровни)
    // Начинающим полезнее видеть простые слова
    if (result.hsk_level !== null && result.hsk_level >= 1 && result.hsk_level <= 3) {
      const hskBonus = 0.15 * (4 - result.hsk_level) / 3; // 1 уровень: 0.15, 3 уровень: 0.05
      score += hskBonus;
    }

    return score;
  }

  /**
   * Детальный поиск для отладки и анализа
   * Возвращает результаты всех типов совпадений
   * 
   * @param query - поисковый запрос
   * @param limit - лимит результатов
   * @returns детальные результаты поиска
   */
  async searchDetailed(
    query: string,
    limit: number = 20,
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const inputType = detectInputType(query);
    const normalizedQuery = this.normalizeQuery(query, inputType);
    const queryType = this.mapInputTypeToQueryType(inputType);

    try {
      const results = await this.prisma.$queryRaw<SearchResult[]>`
        SELECT * FROM search_enhanced_detailed(
          ${normalizedQuery}::text,
          ${queryType}::text,
          ${limit}::integer
        )
      `;

      this.logger.debug(
        `Detailed search results for "${query}":`,
        JSON.stringify(results, null, 2),
      );

      return results || [];
    } catch (error) {
      this.logger.error(`Detailed search failed:`, error);
      return [];
    }
  }
}

