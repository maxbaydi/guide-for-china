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
      this.logger.log('✅ Redis connected in User Service');
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
   * Получить текущее количество запросов пользователя за день
   */
  async getDailyRequests(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `rate_limit:${userId}:${today}`;
    const value = await this.client.get(key);
    return value ? parseInt(value, 10) : 0;
  }
}

