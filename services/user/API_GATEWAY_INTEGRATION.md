# Интеграция User Service с API Gateway

## Обзор

User Service предоставляет GraphQL API для аутентификации. API Gateway должен проксировать запросы к User Service и управлять маршрутизацией.

## Вариант 1: HTTP Proxy (Рекомендуется для MVP)

Простое проксирование HTTP запросов от клиента к User Service.

### Обновление API Gateway

```typescript
// services/api-gateway/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.USER_SERVICE_URL || 'http://user-service:4002',
      timeout: 5000,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// services/api-gateway/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private httpService: HttpService) {}

  async register(email: string, password: string, displayName?: string) {
    const query = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          refreshToken
          user { id email displayName role }
        }
      }
    `;

    const { data } = await firstValueFrom(
      this.httpService.post('/graphql', {
        query,
        variables: {
          input: { email, password, displayName },
        },
      }),
    );

    return data.data.register;
  }

  async login(email: string, password: string) {
    const query = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          refreshToken
          user { id email lastLoginAt }
        }
      }
    `;

    const { data } = await firstValueFrom(
      this.httpService.post('/graphql', {
        query,
        variables: {
          input: { email, password },
        },
      }),
    );

    return data.data.login;
  }

  async refreshToken(refreshToken: string) {
    const query = `
      mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          accessToken
          refreshToken
          user { id email }
        }
      }
    `;

    const { data } = await firstValueFrom(
      this.httpService.post('/graphql', {
        query,
        variables: { refreshToken },
      }),
    );

    return data.data.refreshToken;
  }

  async getMe(accessToken: string) {
    const query = `
      query Me {
        me {
          id email displayName avatarUrl role
          emailVerified createdAt lastLoginAt
        }
      }
    `;

    const { data } = await firstValueFrom(
      this.httpService.post(
        '/graphql',
        { query },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return data.data.me;
  }
}
```

```typescript
// services/api-gateway/src/auth/auth.controller.ts
import { Controller, Post, Get, Body, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; displayName?: string },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.displayName,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('me')
  async getMe(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.getMe(token);
  }
}
```

### Обновление docker-compose.yml для API Gateway

```yaml
api-gateway:
  build:
    context: ./services/api-gateway
    dockerfile: Dockerfile
  container_name: guide-api-gateway
  environment:
    REDIS_URL: redis://redis:6379
    USER_SERVICE_URL: http://user-service:4002
    DICTIONARY_SERVICE_URL: http://dictionary-service:4001
    PORT: 4000
    NODE_ENV: ${NODE_ENV:-development}
  ports:
    - "4000:4000"
  depends_on:
    - redis
    - user-service
    - dictionary-service
  networks:
    - guide-network
  restart: unless-stopped
```

## Вариант 2: GraphQL Federation (Для масштабирования)

Для больших проектов рекомендуется Apollo Federation.

### В User Service

```typescript
// services/user/src/user/entities/user.entity.ts
import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: string;
  
  // ... остальные поля
}
```

### В API Gateway

```typescript
// Использовать Apollo Gateway
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://user-service:4002/graphql' },
      { name: 'dictionary', url: 'http://dictionary-service:4001/graphql' },
    ],
  }),
});
```

## Вариант 3: REST API в API Gateway

Предоставить REST endpoints для клиентов:

```typescript
// API Gateway маршруты
POST   /api/v1/auth/register    → User Service
POST   /api/v1/auth/login       → User Service
POST   /api/v1/auth/refresh     → User Service
GET    /api/v1/auth/me          → User Service
POST   /api/v1/auth/logout      → User Service

GET    /api/v1/dictionary/search    → Dictionary Service
GET    /api/v1/dictionary/:id       → Dictionary Service
```

## Middleware для JWT валидации

```typescript
// services/api-gateway/src/auth/jwt.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload;
      return true;
    } catch {
      return false;
    }
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Схема взаимодействия

```
┌─────────────┐
│   Client    │
│  (Mobile)   │
└──────┬──────┘
       │
       │ HTTP/GraphQL
       │
┌──────▼──────────────┐
│   API Gateway       │
│   Port: 4000        │
│   ─────────────     │
│   - CORS            │
│   - Rate Limiting   │
│   - Authentication  │
│   - Routing         │
└──────┬──────┬───────┘
       │      │
       │      └────────────────────┐
       │                           │
┌──────▼──────────┐    ┌──────────▼────────┐
│  User Service   │    │ Dictionary Service│
│  Port: 4002     │    │  Port: 4001       │
│  ───────────    │    │  ────────────     │
│  - Auth         │    │  - Search         │
│  - JWT          │    │  - Characters     │
│  - Users        │    │  - Definitions    │
└──────┬──────────┘    └──────┬────────────┘
       │                      │
       └──────────┬───────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │   Port: 5432    │
         └─────────────────┘
```

## Переменные окружения для интеграции

```env
# API Gateway .env
USER_SERVICE_URL=http://user-service:4002
DICTIONARY_SERVICE_URL=http://dictionary-service:4001
JWT_SECRET=same-as-user-service
JWT_REFRESH_SECRET=same-as-user-service
REDIS_URL=redis://redis:6379
PORT=4000
```

## Тестирование интеграции

### Через API Gateway (после настройки)
```bash
# Регистрация через Gateway
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Вход через Gateway
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Получение профиля
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

## Рекомендации

1. **Для MVP**: Используйте Вариант 1 (HTTP Proxy) - простой и быстрый
2. **Для масштабирования**: Переходите на GraphQL Federation
3. **Безопасность**: JWT секреты должны быть одинаковыми в Gateway и User Service
4. **Мониторинг**: Добавьте логирование всех запросов между сервисами
5. **Таймауты**: Установите разумные таймауты (3-5 секунд)
6. **Retry логика**: Добавьте повторные попытки при сбоях

## Следующие шаги

1. Реализовать HTTP Proxy в API Gateway
2. Добавить JWT middleware в Gateway
3. Настроить CORS для мобильного приложения
4. Добавить rate limiting
5. Настроить мониторинг и логирование

