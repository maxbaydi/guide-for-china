# HanGuide Mobile App

Мобильное приложение HanGuide - современный китайско-русский словарь с глубоким анализом иероглифов.

## Технологический стек

- **Expo SDK 54+** - фреймворк для React Native
- **Expo Router** - файловая маршрутизация
- **Gluestack UI v2** - компоненты интерфейса
- **Apollo Client** - GraphQL клиент для работы с User Service
- **TanStack Query** - управление состоянием и кэширование для REST API
- **Axios** - HTTP клиент для Dictionary API
- **i18next** - интернационализация (русский и китайский языки)
- **TypeScript** - типизация

## Структура проекта

```
mobile/
├── app/                         # Expo Router screens
│   ├── (auth)/                 # Экраны аутентификации
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Основные табы приложения
│   │   ├── search.tsx          # Поиск иероглифов
│   │   ├── analyze.tsx         # Анализ текста
│   │   ├── collections.tsx     # Коллекции слов
│   │   └── profile.tsx         # Профиль пользователя
│   ├── character/[id].tsx      # Детали иероглифа
│   ├── collection/[id].tsx     # Детали коллекции
│   ├── analyze/results.tsx     # Результаты анализа
│   ├── _layout.tsx             # Root layout с провайдерами
│   └── index.tsx               # Корневой роутинг
├── components/                  # Переиспользуемые компоненты
├── constants/                   # Константы и конфигурация
│   ├── Colors.ts               # Цветовая палитра
│   └── config.ts               # API endpoints и настройки
├── hooks/                       # Custom hooks
│   └── useAuth.tsx             # Auth context и hook
├── locales/                     # Переводы i18n
│   ├── ru/common.json          # Русские переводы
│   └── zh/common.json          # Китайские переводы
├── services/                    # API сервисы
│   ├── api.ts                  # Axios instance с interceptors
│   ├── apollo.ts               # Apollo Client конфигурация
│   └── i18n.ts                 # i18n конфигурация
├── types/                       # TypeScript типы
│   └── api.types.ts            # API типы
└── gluestack-ui.config.ts      # Кастомизация Gluestack UI

```

## Установка и запуск

### Требования

- Node.js 20+
- npm 10+
- Expo CLI
- iOS Simulator (для macOS) или Android Emulator

### Установка зависимостей

```bash
cd mobile
npm install
```

### Запуск приложения

```bash
# Запуск Expo dev server
npm start

# Запуск на iOS симуляторе
npm run ios

# Запуск на Android эмуляторе
npm run android

# Запуск веб-версии
npm run web
```

### Очистка кэша

```bash
npm run reset
```

## Конфигурация API

API endpoints настраиваются в `constants/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: getApiUrl(),        // REST API (Dictionary, Auth)
  GRAPHQL_URL: getGraphQLUrl(), // GraphQL API (User Service)
};
```

По умолчанию:
- **iOS Simulator**: `http://localhost:4000/api/v1`
- **Android Emulator**: `http://10.0.2.2:4000/api/v1`
- **Production**: `https://api.hanguide.com/api/v1`

## Функциональность

### ✅ Реализовано

- **Аутентификация**
  - Регистрация по email/паролю
  - Вход в систему
  - Auto-refresh JWT токенов
  - Secure storage для токенов

- **Поиск иероглифов**
  - Полнотекстовый поиск с debounce
  - История поиска (интерактивная)
  - Результаты поиска с навигацией к деталям

- **Детали иероглифа**
  - Отображение упрощенного и традиционного написания
  - Пиньинь с тонами
  - Радикал, количество черт, HSK уровень
  - Определения и примеры использования

- **Анализ текста**
  - Разбор китайского текста на иероглифы
  - Перевод каждого иероглифа
  - Навигация к деталям иероглифа

- **Коллекции слов**
  - Просмотр коллекций через GraphQL
  - Навигация к деталям коллекции
  - Список слов в коллекции

- **Профиль пользователя**
  - Статистика (слов изучено, поисков, минут)
  - Статус подписки
  - Выход из системы

- **i18n**
  - Русский язык
  - Китайский язык
  - Автоопределение языка устройства

### 🚧 В разработке

- Добавление иероглифов в коллекции
- Создание новых коллекций
- Аудио произношение иероглифов
- Офлайн режим
- Push-уведомления "Слово дня"

## Стилизация

Приложение использует кастомизированную цветовую палитру на основе дизайна HanGuide:

- **Primary** (#E53935) - красный, основной акцент
- **Secondary** (#1DB954) - зеленый, прогресс и успех
- **Background** (#F7F7F7) - светло-серый фон
- **Text** (#2D2D2D) - темный текст
- **TextLight** (#6B7280) - светлый текст

## Интеграция с бэкендом

Приложение интегрируется с тремя микросервисами:

1. **API Gateway** (REST) - `http://localhost:4000/api/v1`
   - `/auth/*` - аутентификация
   - `/dictionary/*` - поиск и детали иероглифов

2. **User Service** (GraphQL) - `http://localhost:4002/graphql`
   - `myStatistics` - статистика пользователя
   - `myCollections` - коллекции пользователя

3. **Dictionary Service** (через API Gateway)
   - Полнотекстовый поиск с pg_jieba
   - Анализ китайского текста

## Лицензия

Proprietary - All rights reserved

## Автор

HanGuide Team

