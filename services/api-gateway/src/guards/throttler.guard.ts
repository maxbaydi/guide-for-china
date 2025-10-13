import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Если пользователь аутентифицирован, используем его ID для rate limiting
    if (req.userId) {
      return `user:${req.userId}`;
    }
    
    // Иначе используем IP адрес
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }
}

