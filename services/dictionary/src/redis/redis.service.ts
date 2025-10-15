import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis connected in Dictionary Service');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Получить значение из кэша
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Установить значение в кэш с TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Удалить значение из кэша
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Кеширование результатов поиска иероглифов
   */
  async cacheSearchResults(query: string, results: any, ttlSeconds: number = 300): Promise<void> {
    const key = `search:${query}`;
    await this.set(key, JSON.stringify(results), ttlSeconds);
  }

  /**
   * Получение кешированных результатов поиска
   */
  async getCachedSearchResults(query: string): Promise<any | null> {
    const key = `search:${query}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Кеширование иероглифа
   */
  async cacheCharacter(id: string, character: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `character:${id}`;
    await this.set(key, JSON.stringify(character), ttlSeconds);
  }

  /**
   * Получение кешированного иероглифа
   */
  async getCachedCharacter(id: string): Promise<any | null> {
    const key = `character:${id}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Кеширование слова дня
   */
  async cacheWordOfTheDay(character: any, ttlSeconds: number = 86400): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `word-of-day:${today}`;
    await this.set(key, JSON.stringify(character), ttlSeconds);
  }

  /**
   * Получение кешированного слова дня
   */
  async getCachedWordOfTheDay(): Promise<any | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = `word-of-day:${today}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Кеширование результатов анализа текста
   */
  async cacheAnalysisResults(text: string, results: any, ttlSeconds: number = 1800): Promise<void> {
    const key = `analysis:${text}`;
    await this.set(key, JSON.stringify(results), ttlSeconds);
  }

  /**
   * Получение кешированных результатов анализа
   */
  async getCachedAnalysisResults(text: string): Promise<any | null> {
    const key = `analysis:${text}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Кеширование результатов поиска фраз
   */
  async cachePhraseSearchResults(query: string, results: any, ttlSeconds: number = 300): Promise<void> {
    const key = `phrase-search:${query}`;
    await this.set(key, JSON.stringify(results), ttlSeconds);
  }

  /**
   * Получение кешированных результатов поиска фраз
   */
  async getCachedPhraseSearchResults(query: string): Promise<any | null> {
    const key = `phrase-search:${query}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Инвалидация кеша по паттерну
   */
  async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
      this.logger.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  }
}

