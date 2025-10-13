# Стек технологий для проекта «Гид по Китаю»

## Frontend (Mobile-First)

### Основной фреймворк
- **React Native** - основной фреймворк для разработки мобильного приложения
- **Expo SDK 52+** - платформа для упрощения разработки и деплоя
  - `expo` - основной пакет Expo
  - `expo-router` - файловая маршрутизация для навигации
  - `expo-auth-session` - аутентификация пользователей
  - `expo-secure-store` - безопасное хранение токенов
  - `expo-sqlite` - локальная база данных для офлайн-режима
  - `expo-notifications` - push-уведомления
  - `expo-camera` - сканирование иероглифов с камеры
  - `expo-haptics` - тактильная обратная связь

### UI библиотеки и компоненты
- **Gluestack UI v2** - современная UI библиотека для React Native и Web
  - Преимущества: универсальность, доступность (WAI-ARIA), нестилизованные компоненты
  - Поддержка темизации и кастомизации
- **React Native Paper** - Material Design компоненты
- **React Native Reanimated** - плавные анимации
- **React Native Gesture Handler** - обработка жестов

### Управление состоянием
- **Zustand** - легковесное управление состоянием (альтернатива Redux)
- **TanStack Query (React Query)** - управление серверным состоянием и кэшированием
  - Автоматический рефетчинг
  - Оптимистичные обновления
  - Офлайн поддержка

### GraphQL клиент
- **Apollo Client** - клиент для работы с GraphQL
  - `@apollo/client` - основной пакет
  - Встроенное кэширование
  - TypeScript кодогенерация

### Навигация
- **Expo Router** - файловая навигация (аналог Next.js для мобильных)

### Утилиты
- **date-fns** - работа с датами
- **zod** - валидация схем данных
- **react-hook-form** - управление формами

---

## Backend (Микросервисная архитектура)

### Основной фреймворк
- **NestJS v10+** - TypeScript фреймворк для Node.js
  - Встроенная поддержка микросервисов
  - Dependency Injection
  - Модульная архитектура

### API Layer
- **GraphQL** - основной API для мобильного приложения
  - `@nestjs/graphql` - интеграция GraphQL в NestJS
  - `apollo-server-express` - GraphQL сервер
  - `type-graphql` - декларативное описание схем
  - `graphql-upload` - загрузка файлов
- **REST API** - для внешних интеграций и вебхуков
  - `@nestjs/swagger` - автогенерация API документации

### Базы данных

#### PostgreSQL (Dictionary Service, User Service)
- **Prisma ORM** - современная ORM для TypeScript
  - Преимущества: отличная типизация, простые миграции, Prisma Studio
  - `@prisma/client` - клиент для работы с БД
  - `prisma` - CLI для миграций
- **pg_jieba** - расширение PostgreSQL для полнотекстового поиска по китайскому

#### MongoDB (Community Service)
- **Mongoose** - ODM для MongoDB
  - `@nestjs/mongoose` - интеграция с NestJS
  - Схемы для краудсорсингового контента

#### Redis (Caching Layer)
- **ioredis** - клиент Redis для Node.js
  - `@nestjs/cache-manager` - кэширование в NestJS
  - Кэширование запросов словаря
  - Сессии пользователей
  - Rate limiting

#### Elasticsearch (Search Service)
- **@elastic/elasticsearch** - клиент для Elasticsearch
  - Индексация иероглифов
  - Fuzzy search
  - Семантический поиск

### Микросервисы транспорт
- **gRPC** - для межсервисного взаимодействия
  - `@grpc/grpc-js` - gRPC для Node.js
  - `@grpc/proto-loader` - загрузка proto файлов
- **RabbitMQ** (опционально) - очереди сообщений для асинхронных задач
  - `@nestjs/microservices` - микросервисы в NestJS
  - `amqplib` - клиент RabbitMQ

### Аутентификация и авторизация
- **Passport.js** - стратегии аутентификации
  - `@nestjs/passport` - интеграция с NestJS
  - `passport-jwt` - JWT стратегия
  - `passport-google-oauth20` - Google OAuth
- **bcrypt** - хэширование паролей
- **jsonwebtoken** - генерация JWT токенов

### Система подписок (Subscription Service)

#### Платежные системы
- **Stripe** (основной, если доступен)
  - `stripe` - официальный SDK
  - Поддержка подписок, вебхуков, возвратов
- **Альтернативы для России и Китая:**
  - **ЮKassa** - для российского рынка
    - `@a2seven/yoo-checkout` - SDK для Node.js
  - **CloudPayments** - альтернатива для РФ
  - **Alipay/WeChat Pay** - для китайского рынка
    - Интеграция через SDK или REST API

#### Управление подписками
- **@nestjs/bull** - очереди для обработки платежей
- **node-cron** - планировщик задач для проверки подписок
- **@nestjs/event-emitter** - события для синхронизации подписок

### Валидация и трансформация
- **class-validator** - валидация DTO
- **class-transformer** - трансформация объектов

### Логирование и мониторинг
- **winston** - логирование
  - `nest-winston` - интеграция с NestJS
- **Sentry** - мониторинг ошибок
  - `@sentry/node` - SDK для Node.js

---

## Инфраструктура

### Контейнеризация
- **Docker** - контейнеризация всех сервисов
- **Docker Compose** - оркестрация микросервисов
  - Упрощенная альтернатива Kubernetes
  - Профили для development/production
  - Автоматический рестарт сервисов

### Reverse Proxy и Load Balancing
- **Nginx** - reverse proxy для API Gateway
  - Балансировка нагрузки между инстансами
  - SSL терминация
  - Статические файлы

### CI/CD
- **GitHub Actions** - CI/CD пайплайны
  - Автотесты
  - Сборка Docker образов
  - Деплой на сервер

### Хостинг и деплой
- **Hetzner / DigitalOcean** - VPS хостинг
- **Docker Swarm** (опционально) - простая оркестрация для масштабирования

---

## Инструменты разработки

### IDE и AI-ассистенты
- **Cursor IDE** - основная IDE с AI для вайб-кодинга
  - Встроенный GitHub Copilot аналог
  - Контекстное понимание проекта

### Code Quality
- **ESLint** - линтер для TypeScript/JavaScript
- **Prettier** - форматирование кода
- **Husky** - Git hooks для проверки перед коммитом
- **lint-staged** - линтинг только измененных файлов

### Testing
- **Jest** - unit тесты
- **Supertest** - тестирование API
- **@testing-library/react-native** - тестирование React Native компонентов

### Type Safety
- **TypeScript 5+** - строгая типизация
- **GraphQL Codegen** - автогенерация TypeScript типов из GraphQL схемы
  - `@graphql-codegen/cli`
  - `@graphql-codegen/typescript`
  - `@graphql-codegen/typescript-operations`

---

## Дополнительные библиотеки

### Работа с китайским языком
- **pinyin** - конвертация иероглифов в пиньинь
- **hanzi-writer** - анимация написания иероглифов
- **opencc-js** - конвертация упрощенных и традиционных иероглифов

### Аналитика
- **Mixpanel** - аналитика событий пользователей
  - `mixpanel` - SDK для Node.js
  - `mixpanel-react-native` - SDK для React Native

### Push-уведомления
- **Expo Notifications** - для мобильного приложения
- **FCM (Firebase Cloud Messaging)** - backend для отправки уведомлений
  - `firebase-admin` - SDK для Node.js

### Файловое хранилище
- **AWS S3** или **MinIO** (self-hosted) - хранение аудио, изображений
  - `@aws-sdk/client-s3` - AWS SDK
  - `minio` - self-hosted альтернатива

---

## Структура монорепозитория

```
chinese-guide-app/
├── mobile/                    # Expo приложение
├── services/
│   ├── api-gateway/          # NestJS API Gateway
│   ├── dictionary/           # Dictionary Service
│   ├── user/                 # User Service  
│   ├── subscription/         # Subscription Service
│   ├── community/            # Community Service
│   └── search/               # Search Service
├── packages/
│   ├── shared-types/         # Общие TypeScript типы
│   ├── graphql-schema/       # GraphQL схемы
│   └── prisma-schema/        # Prisma схемы
├── infrastructure/
│   ├── docker-compose.yml    # Docker Compose конфигурация
│   ├── nginx/                # Nginx конфигурация
│   └── scripts/              # Утилитные скрипты
└── docs/                     # Документация
```

---

## Бесплатные альтернативы платным сервисам

| Сервис | Бесплатная альтернатива |
|--------|------------------------|
| Stripe | ЮKassa (РФ), Alipay (Китай) |
| AWS S3 | MinIO (self-hosted) |
| MongoDB Atlas | MongoDB (self-hosted в Docker) |
| Elasticsearch Cloud | Elasticsearch (self-hosted) |
| Sentry | Self-hosted Sentry |
| Mixpanel | Plausible (self-hosted) или PostHog |

---

## Версии основных зависимостей

```json
{
  "expo": "^52.0.0",
  "react-native": "~0.76.0",
  "@nestjs/core": "^10.4.0",
  "prisma": "^6.0.0",
  "@apollo/client": "^3.11.0",
  "stripe": "^17.0.0",
  "typescript": "^5.6.0"
}
```

---

## Итоговый стек (краткая версия)

**Mobile:** React Native + Expo + Gluestack UI + Apollo Client  
**Backend:** NestJS + Prisma + GraphQL + gRPC  
**Databases:** PostgreSQL (pg_jieba) + MongoDB + Redis + Elasticsearch  
**Payments:** Stripe / ЮKassa / Alipay  
**Infrastructure:** Docker + Docker Compose + Nginx  
**DevTools:** Cursor IDE + TypeScript + GitHub Actions

Этот стек обеспечивает быструю разработку с вайб-кодингом, высокую производительность и легкое масштабирование.
