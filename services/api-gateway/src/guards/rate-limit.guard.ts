import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      // Если нет токена, применяем глобальный rate limit для анонимных запросов
      return this.checkAnonymousRateLimit(request);
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub;
      const tier = payload.subscriptionTier || 'FREE';

      // Лимиты в зависимости от тарифа
      const limits = {
        FREE: { requests: 50, window: 86400 }, // 50 запросов в день
        PREMIUM: { requests: 10000, window: 86400 }, // 10000 запросов в день
      };

      const limit = limits[tier] || limits.FREE;
      const key = `rate_limit:${userId}:${this.getToday()}`;

      const current = await this.redisService.increment(key);

      if (current === 1) {
        // Устанавливаем TTL только при первом запросе
        await this.redisService.expire(key, limit.window);
      }

      if (current > limit.requests) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Daily limit exceeded. Current tier: ${tier}. Limit: ${limit.requests} requests per day.`,
            tier,
            limit: limit.requests,
            used: current,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Добавляем информацию о лимитах в заголовки ответа
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', limit.requests);
      response.setHeader('X-RateLimit-Remaining', limit.requests - current);
      response.setHeader('X-RateLimit-Reset', this.getTomorrowTimestamp());

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Если токен невалидный, применяем анонимный rate limit
      return this.checkAnonymousRateLimit(request);
    }
  }

  private async checkAnonymousRateLimit(request: any): Promise<boolean> {
    const ip = request.ip || request.connection.remoteAddress;
    const key = `rate_limit:anonymous:${ip}:${this.getToday()}`;
    const limit = 10; // 10 запросов в день для анонимных пользователей
    const window = 86400;

    const current = await this.redisService.increment(key);

    if (current === 1) {
      await this.redisService.expire(key, window);
    }

    if (current > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily limit exceeded for anonymous users. Please sign in.',
          limit,
          used: current,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const response = request.res;
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', limit - current);
    response.setHeader('X-RateLimit-Reset', this.getTomorrowTimestamp());

    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getTomorrowTimestamp(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return Math.floor(tomorrow.getTime() / 1000);
  }
}

