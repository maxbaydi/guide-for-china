# User Service

User Service для приложения "Гид по Китаю" - сервис аутентификации и управления пользователями с JWT.

## Функциональность

- ✅ Регистрация пользователей с email/password
- ✅ Вход в систему (login)
- ✅ JWT аутентификация с access и refresh токенами
- ✅ Обновление токенов (refresh token flow)
- ✅ Выход из системы (logout)
- ✅ Выход со всех устройств
- ✅ Управление профилем пользователя
- ✅ GraphQL API
- ✅ Passport.js стратегии (JWT, Local)

## Технологический стек

- **Framework**: NestJS
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: JWT + Passport.js
- **API**: GraphQL
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Установка и запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env

# Генерация Prisma Client
npm run prisma:generate

# Запуск миграций
npm run prisma:migrate

# Запуск в режиме разработки
npm run start:dev
```

### Docker

```bash
# Сборка образа
docker build -t user-service .

# Запуск контейнера
docker run -p 4002:4002 --env-file .env user-service
```

## GraphQL API

Сервис доступен по адресу: `http://localhost:4002/graphql`

### Мутации

#### Регистрация

```graphql
mutation Register {
  register(input: {
    email: "user@example.com"
    password: "SecurePass123"
    displayName: "John Doe"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      displayName
      role
      createdAt
    }
  }
}
```

#### Вход

```graphql
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "SecurePass123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      displayName
      lastLoginAt
    }
  }
}
```

#### Обновление токенов

```graphql
mutation RefreshToken {
  refreshToken(refreshToken: "your-refresh-token-here") {
    accessToken
    refreshToken
    user {
      id
      email
    }
  }
}
```

#### Выход

```graphql
mutation Logout {
  logout(refreshToken: "your-refresh-token-here")
}
```

#### Выход со всех устройств

```graphql
mutation LogoutAll {
  logoutAll
}
```

### Запросы

#### Получить текущего пользователя

```graphql
query Me {
  me {
    id
    email
    displayName
    avatarUrl
    role
    emailVerified
    createdAt
    lastLoginAt
  }
}
```

**Требуется**: Bearer token в заголовке `Authorization`

```
Authorization: Bearer your-access-token-here
```

#### Обновить профиль

```graphql
mutation UpdateProfile {
  updateProfile(
    displayName: "New Name"
    avatarUrl: "https://example.com/avatar.jpg"
  ) {
    id
    displayName
    avatarUrl
  }
}
```

## Структура проекта

```
src/
├── auth/                    # Модуль аутентификации
│   ├── decorators/         # Декораторы (CurrentUser)
│   ├── dto/                # Data Transfer Objects
│   ├── guards/             # Guards (JwtAuthGuard)
│   ├── strategies/         # Passport стратегии
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
├── user/                    # Модуль пользователей
│   ├── entities/           # GraphQL entities
│   ├── user.module.ts
│   ├── user.resolver.ts
│   └── user.service.ts
├── prisma/                  # Prisma ORM
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts
```

## Переменные окружения

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chinese_guide"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Service
PORT=4002
NODE_ENV=development
CORS_ORIGIN="*"
```

## Безопасность

- Пароли хешируются с помощью bcrypt (10 раундов)
- Access токены живут 2 часа
- Refresh токены живут 30 дней и хранятся в базе данных
- JWT подписываются секретными ключами
- Все защищенные эндпоинты требуют валидный JWT токен
- Поддержка деактивации аккаунтов
- Автоматическое обновление токенов при истечении (реализовано в мобильном приложении)

## База данных

### Модель User

```prisma
model User {
  id            String       @id @default(uuid())
  email         String       @unique
  passwordHash  String?
  displayName   String?
  avatarUrl     String?
  provider      AuthProvider @default(EMAIL)
  providerId    String?
  role          UserRole     @default(USER)
  isActive      Boolean      @default(true)
  emailVerified Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  lastLoginAt   DateTime?
  refreshTokens RefreshToken[]
}
```

### Модель RefreshToken

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

## Тестирование

```bash
# Unit тесты
npm run test

# Тесты с coverage
npm run test:cov

# E2E тесты
npm run test:e2e
```

## Интеграция с API Gateway

User Service интегрируется с API Gateway через GraphQL Federation или прямое проксирование запросов.

## Roadmap

- [ ] OAuth интеграция (Google, Apple)
- [ ] Email верификация
- [ ] Сброс пароля через email
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting для аутентификации
- [ ] Audit log для безопасности
- [ ] User sessions management

