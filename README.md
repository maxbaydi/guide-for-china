# Гид по Китаю - Backend API

Современный китайско-русский словарь с микросервисной архитектурой.

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 20+ и npm 10+
- Git

### Установка

1. Клонировать репозиторий:
```bash
git clone <repository-url>
cd guide-for-china
```

2. Скопировать и настроить переменные окружения:
```bash
cp .env.example .env
```

3. Запустить инфраструктуру:
```bash
docker-compose up -d
```

4. Проверить статус контейнеров:
```bash
docker-compose ps
```

### Доступ к сервисам

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **pgAdmin**: `http://localhost:5050`
  - Email: admin@admin.com
  - Password: admin

## 📁 Структура проекта

```
guide-for-china/
├── db_bkrs/                    # Исходные данные BKRS словаря
├── services/                   # Микросервисы
│   ├── api-gateway/           # API Gateway
│   ├── dictionary/            # Словарный сервис
│   ├── user/                  # Пользовательский сервис
│   └── subscription/          # Сервис подписок
├── packages/                   # Общие пакеты
│   └── shared-types/          # Общие типы и утилиты
├── infrastructure/            # Инфраструктурные конфигурации
│   ├── postgres/             # PostgreSQL с pg_jieba
│   └── nginx/                # Nginx конфигурация
├── locales/                   # i18n переводы
│   ├── ru/                   # Русский язык
│   └── zh/                   # Китайский язык
└── docker-compose.yml        # Docker Compose конфигурация
```

## 🛠 Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск тестов

```bash
npm test
```

### Сборка проекта

```bash
npm run build
```

## 🐳 Docker команды

### Запуск всех сервисов
```bash
docker-compose up -d
```

### Остановка всех сервисов
```bash
docker-compose down
```

### Просмотр логов
```bash
docker-compose logs -f [service-name]
```

### Пересборка контейнеров
```bash
docker-compose up -d --build
```

## 🧪 Тестирование

Каждый микросервис содержит свои unit и integration тесты:

```bash
# Тесты для shared-types
cd packages/shared-types
npm test

# Тесты для dictionary service
cd services/dictionary
npm test
```

## 📝 Локализация

Проект поддерживает два языка:
- Русский (ru) - основной язык, полностью реализован
- Китайский (zh) - заглушки для будущего перевода

Файлы переводов находятся в `locales/`:
- `common.json` - общие переводы
- `errors.json` - сообщения об ошибках
- `validation.json` - валидационные сообщения

## 🗄️ База данных

### Подключение к PostgreSQL

```bash
psql -h localhost -U postgres -d chinese_guide
```

### pg_jieba расширение

PostgreSQL настроен с расширением pg_jieba для полнотекстового поиска по китайскому языку.

## 📚 API Документация

После запуска сервисов, GraphQL Playground будет доступен по адресу:
- `http://localhost:4000/graphql`

## 🔐 Безопасность

- JWT токены используются для аутентификации
- Bcrypt для хэширования паролей
- Rate limiting для защиты от злоупотреблений
- CORS настроен для мобильного приложения

## 🚢 Деплой

### Production Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD

GitHub Actions автоматически запускает тесты и деплой при push в main ветку.

## 📄 Лицензия

Proprietary

## 👥 Авторы

Разработано с использованием AI-assisted development (Cursor IDE)

