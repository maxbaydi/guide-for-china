# План последовательной разработки MVP «Гид по Китаю»

## Общая информация

**Цель MVP:** Создать базовую версию мобильного приложения китайско-русского словаря с возможностью поиска, разбора иероглифов и системой подписок.

**Срок реализации:** 8-10 недель

**Архитектура:** Микросервисная с Docker Compose

**Приоритет:** Mobile-First (веб-версия в будущих итерациях)

---

## Фаза 0: Подготовка и настройка окружения (1 неделя)

### Задачи:

1. **Настройка инфраструктуры (2 дня)**
   - Установка Docker и Docker Compose
   - Настройка Cursor IDE с плагинами для NestJS и React Native
   - Создание GitHub репозитория с монорепо структурой
   - Настройка `.gitignore`, `README.md`

2. **Создание базовой структуры проекта (2 дня)**
   - Инициализация Expo проект: `npx create-expo-app mobile`
   - Создание папок для микросервисов: `services/{api-gateway, dictionary, user, subscription}`
   - Настройка общих типов: `packages/shared-types`
   - Создание базового `docker-compose.yml`

3. **Настройка баз данных в Docker (2 дня)**
   - PostgreSQL контейнер с pg_jieba расширением
   - Redis контейнер для кэширования
   - MongoDB контейнер (подготовка для Community Service)
   - pgAdmin для управления PostgreSQL

4. **Подготовка данных словаря (1 день)**
   - Парсинг базовых данных с БКРС или использование открытых словарей
   - Создание CSV файла с ~1000-5000 базовых иероглифов для MVP
   - Подготовка структуры данных: иероглиф, пиньинь, переводы, примеры

**Результат:** Готовая инфраструктура для разработки, базовая структура проекта

---

## Фаза 1: Dictionary Service (2 недели)

### Неделя 1: Backend Dictionary Service

1. **Создание Dictionary Service на NestJS (2 дня)**
   - Инициализация NestJS проекта: `nest new dictionary-service`
   - Настройка Prisma ORM
   - Создание схемы БД для словаря:
     ```prisma
     model Character {
       id          String   @id @default(uuid())
       simplified  String   @unique
       traditional String?
       pinyin      String
       radical     String?
       strokes     Int?
       frequency   Int?
       createdAt   DateTime @default(now())

       definitions Definition[]
       examples    Example[]
     }

     model Definition {
       id           String    @id @default(uuid())
       characterId  String
       character    Character @relation(fields: [characterId], references: [id])
       translation  String
       partOfSpeech String?
       order        Int       @default(0)
     }

     model Example {
       id           String    @id @default(uuid())
       characterId  String
       character    Character @relation(fields: [characterId], references: [id])
       chinese      String
       pinyin       String
       translation  String
     }
     ```
   - Запуск миграций: `npx prisma migrate dev`

2. **Импорт начальных данных (1 день)**
   - Создание seed скрипта для импорта CSV в PostgreSQL
   - Загрузка базовых 1000-5000 иероглифов
   - Создание индексов для быстрого поиска

3. **Разработка GraphQL API (2 дня)**
   - Настройка `@nestjs/graphql`
   - Создание GraphQL схемы:
     ```graphql
     type Query {
       searchCharacters(query: String!, limit: Int): [Character!]!
       getCharacter(id: String!): Character
       analyzeText(text: String!): [CharacterAnalysis!]!
     }

     type Character {
       id: ID!
       simplified: String!
       traditional: String
       pinyin: String!
       definitions: [Definition!]!
       examples: [Example!]!
     }
     ```
   - Реализация резолверов для поиска и получения деталей

4. **Dockerization и тестирование (2 дня)**
   - Создание `Dockerfile` для Dictionary Service
   - Добавление сервиса в `docker-compose.yml`
   - Написание базовых unit-тестов
   - Тестирование GraphQL запросов через GraphQL Playground

### Неделя 2: API Gateway

1. **Создание API Gateway (3 дня)**
   - Инициализация NestJS проекта для API Gateway
   - Настройка GraphQL Federation или Gateway
   - Маршрутизация запросов к Dictionary Service через gRPC
   - Настройка CORS для мобильного приложения
   - Добавление rate limiting с Redis

2. **Настройка кэширования (2 дня)**
   - Интеграция Redis с API Gateway
   - Кэширование популярных запросов (TTL: 1 час)
   - Реализация стратегии инвалидации кэша

**Результат:** Работающий Dictionary Service с GraphQL API через API Gateway

---

## Фаза 2: User Service и аутентификация (1.5 недели)

1. **Создание User Service (3 дня)**
   - Инициализация NestJS проекта
   - Настройка Prisma с PostgreSQL
   - Создание схемы пользователей:
     ```prisma
     model User {
       id            String    @id @default(uuid())
       email         String    @unique
       passwordHash  String?
       displayName   String?
       avatarUrl     String?
       provider      String?   // google, email
       providerId    String?
       subscription  Subscription?
       createdAt     DateTime  @default(now())
       updatedAt     DateTime  @updatedAt
     }
     ```
   - Реализация bcrypt хэширования паролей

2. **JWT аутентификация (2 дня)**
   - Настройка Passport.js с JWT стратегией
   - Эндпоинты: `/auth/register`, `/auth/login`, `/auth/refresh`
   - GraphQL мутации:
     ```graphql
     type Mutation {
       register(email: String!, password: String!): AuthPayload!
       login(email: String!, password: String!): AuthPayload!
       refreshToken(token: String!): AuthPayload!
     }

     type AuthPayload {
       accessToken: String!
       refreshToken: String!
       user: User!
     }
     ```

3. **OAuth интеграция (2 дня)**
   - Google OAuth через `passport-google-oauth20`
   - Эндпоинт: `/auth/google`
   - Автоматическое создание пользователя при первом входе

4. **Интеграция с API Gateway (1 день)**
   - Добавление User Service в API Gateway
   - Middleware для проверки JWT токенов
   - Защита приватных запросов

**Результат:** Полноценная система аутентификации с JWT и OAuth

---

## Фаза 3: Subscription Service (1.5 недели)

1. **Создание Subscription Service (3 дня)**
   - Инициализация NestJS проекта
   - Настройка Prisma с PostgreSQL
   - Создание схемы подписок:
     ```prisma
     enum SubscriptionTier {
       FREE
       BASIC
       PREMIUM
     }

     enum SubscriptionStatus {
       ACTIVE
       CANCELLED
       EXPIRED
       TRIAL
     }

     model Subscription {
       id              String             @id @default(uuid())
       userId          String             @unique
       user            User               @relation(fields: [userId], references: [id])
       tier            SubscriptionTier   @default(FREE)
       status          SubscriptionStatus @default(ACTIVE)
       currentPeriodEnd DateTime?
       cancelAtPeriodEnd Boolean          @default(false)
       createdAt       DateTime           @default(now())
       updatedAt       DateTime           @updatedAt
     }

     model Payment {
       id              String   @id @default(uuid())
       userId          String
       amount          Decimal
       currency        String   @default("RUB")
       provider        String   // stripe, yookassa
       providerPaymentId String
       status          String
       createdAt       DateTime @default(now())
     }
     ```

2. **Интеграция платежной системы (3 дня)**
   - Настройка Stripe SDK (или ЮKassa для РФ)
   - Создание планов подписок:
     - **FREE**: базовый поиск (лимит 50 запросов/день)
     - **BASIC**: 500 запросов/день, сохранение избранного (₽199/мес)
     - **PREMIUM**: безлимит, офлайн режим, аудио произношение (₽499/мес)
   - Webhook для обработки событий оплаты
   - Эндпоинты: `/subscription/create-checkout`, `/subscription/webhook`

3. **GraphQL API для подписок (1 день)**
   - Мутации:
     ```graphql
     type Mutation {
       createCheckoutSession(tier: SubscriptionTier!): CheckoutSession!
       cancelSubscription: Subscription!
     }

     type Query {
       mySubscription: Subscription
       subscriptionPlans: [SubscriptionPlan!]!
     }
     ```

4. **Middleware для проверки лимитов (2 дня)**
   - Декоратор `@RequireSubscription()` для защищенных эндпоинтов
   - Rate limiting в зависимости от тарифа
   - Кэширование статуса подписки в Redis

**Результат:** Работающая система подписок с платежами

---

## Фаза 4: Mobile App (2.5 недели)

### Неделя 1: Базовый UI и навигация

1. **Настройка Expo проекта (1 день)**
   - Инициализация с TypeScript
   - Настройка Expo Router для навигации
   - Установка Gluestack UI и зависимостей
   - Настройка темы приложения

2. **Apollo Client setup (1 день)**
   - Установка `@apollo/client`
   - Настройка GraphQL подключения к API Gateway
   - Генерация TypeScript типов с GraphQL Codegen
   - Настройка кэширования и политик

3. **Экраны аутентификации (2 дня)**
   - Экран входа (email/password)
   - Экран регистрации
   - Google OAuth кнопка
   - Хранение токенов в `expo-secure-store`
   - Автоматический refresh токена

4. **Главный экран поиска (3 дня)**
   - SearchBar с автокомплитом
   - Список результатов поиска
   - Интеграция с `searchCharacters` GraphQL запросом
   - Дебаунс для оптимизации запросов
   - Индикаторы загрузки и ошибок

### Неделя 2: Детальный экран иероглифа

1. **Экран деталей иероглифа (4 дня)**
   - Отображение иероглифа крупным шрифтом
   - Пиньинь и переводы
   - Список примеров использования
   - Информация о радикале и черт ах
   - Интеграция с `getCharacter` GraphQL запросом
   - Skeleton loaders для плавной загрузки

2. **Разбор текста (3 дня)**
   - Экран ввода текста/предложения
   - Вызов `analyzeText` GraphQL запроса
   - Отображение каждого иероглифа с разбором
   - Кликабельные иероглифы → переход к деталям
   - Копирование в буфер обмена

### Неделя 3: Подписки и финализация

1. **Экран подписок (2 дня)**
   - Список тарифных планов
   - Кнопка "Оформить подписку"
   - Интеграция с `createCheckoutSession` мутацией
   - WebView для Stripe Checkout (или нативная интеграция)
   - Отображение текущей подписки

2. **Ограничения по подпискам (2 дня)**
   - Отображение лимитов FREE тарифа
   - Блокировка функций для неподписанных
   - Модальное окно "Upgrade to Premium"
   - Счетчик запросов в день

3. **Полировка UI/UX (3 дня)**
   - Добавление анимаций (Reanimated)
   - Haptic feedback
   - Темная/светлая тема
   - Splash screen и иконка приложения
   - Onboarding экран для новых пользователей

**Результат:** Полнофункциональное MVP мобильное приложение

---

## Фаза 5: Тестирование и деплой (1 неделя)

1. **Тестирование (3 дня)**
   - Unit тесты для критичных сервисов
   - E2E тесты для основных флоу (регистрация, поиск, подписка)
   - Ручное тестирование на iOS и Android
   - Исправление найденных багов

2. **Настройка CI/CD (2 дня)**
   - GitHub Actions для автотестов
   - Автоматическая сборка Docker образов
   - Деплой на VPS (Hetzner/DigitalOcean)
   - Настройка Nginx как reverse proxy
   - SSL сертификаты (Let's Encrypt)

3. **Публикация мобильного приложения (2 дня)**
   - Создание билда через EAS Build
   - Подготовка скриншотов и описания
   - Публикация в Google Play (внутреннее тестирование)
   - Подготовка для App Store (TestFlight)

**Результат:** MVP развернут и доступен для тестирования

---

## Структура Docker Compose для MVP

```yaml
version: '3.8'

services:
  # Базы данных
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: chinese_guide
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  # Микросервисы
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - dictionary-service
      - user-service
      - subscription-service

  dictionary-service:
    build: ./services/dictionary
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chinese_guide
    depends_on:
      - postgres

  user-service:
    build: ./services/user
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chinese_guide
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres

  subscription-service:
    build: ./services/subscription
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chinese_guide
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - YOOKASSA_SECRET_KEY=${YOOKASSA_SECRET_KEY}
    depends_on:
      - postgres

  # Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api-gateway

volumes:
  postgres_data:
  redis_data:
  mongo_data:
```

---

## Критерии завершения MVP

- ✅ Пользователь может зарегистрироваться и войти
- ✅ Поиск по иероглифам работает корректно
- ✅ Детальная информация по иероглифу отображается
- ✅ Разбор текста/предложения функционирует
- ✅ Система подписок интегрирована
- ✅ FREE тариф имеет лимиты запросов
- ✅ Платные подписки работают (тестовые платежи)
- ✅ Приложение собирается на iOS и Android
- ✅ Backend развернут на продакшн сервере
- ✅ API документирован и доступен

---

## Следующие шаги после MVP

1. **Community Service** - краудсорсинг переводов и примеров
2. **Офлайн режим** - синхронизация данных для Premium пользователей
3. **Аудио произношение** - интеграция TTS для озвучки иероглифов
4. **Система карточек** - spaced repetition для обучения
5. **Веб-версия** - адаптация фронтенда для браузеров
6. **OCR сканирование** - распознавание иероглифов с камеры

---

## Оценка времени по фазам

| Фаза | Длительность | Накопительно |
|------|--------------|--------------|
| Фаза 0: Подготовка | 1 неделя | 1 неделя |
| Фаза 1: Dictionary Service | 2 недели | 3 недели |
| Фаза 2: User Service | 1.5 недели | 4.5 недели |
| Фаза 3: Subscription Service | 1.5 недели | 6 недель |
| Фаза 4: Mobile App | 2.5 недели | 8.5 недель |
| Фаза 5: Деплой | 1 неделя | 9.5 недель |

**Итого: ~10 недель (2.5 месяца)**

С учетом непредвиденных задержек и багов, реалистичный срок для MVP — **3 месяца**.
