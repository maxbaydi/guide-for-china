# Настройка бэкенда для разработки мобильного приложения

Перед запуском мобильного приложения необходимо запустить бэкенд сервисы.

## Запуск бэкенда через Docker Compose

### 1. Перейдите в корневую директорию проекта

```bash
cd /path/to/guide-for-china
```

### 2. Запустите все сервисы

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL (порт 5432)
- Redis (порт 6379)
- API Gateway (порт 4000)
- Dictionary Service (порт 4001)
- User Service (порт 4002)

### 3. Проверьте статус сервисов

```bash
docker-compose ps
```

### 4. Проверьте логи при необходимости

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f api-gateway
docker-compose logs -f dictionary-service
docker-compose logs -f user-service
```

## Альтернативный запуск (без Docker)

### 1. Запустите PostgreSQL и Redis локально

```bash
# PostgreSQL (установите если нет)
brew install postgresql@16  # macOS
sudo apt install postgresql-16  # Ubuntu

# Redis
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu

# Запуск
brew services start postgresql@16
brew services start redis
```

### 2. Запустите каждый сервис отдельно

```bash
# Terminal 1 - User Service
cd services/user
npm install
npm run start:dev

# Terminal 2 - Dictionary Service
cd services/dictionary
npm install
npm run start:dev

# Terminal 3 - API Gateway
cd services/api-gateway
npm install
npm run start:dev
```

## Проверка доступности API

### REST API (API Gateway)

```bash
curl http://localhost:4000/api/v1/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2025-10-14T08:00:00.000Z"
}
```

### GraphQL API (User Service)

Откройте в браузере:
```
http://localhost:4002/graphql
```

Вы должны увидеть GraphQL Playground.

### Тестовый поиск иероглифа

```bash
curl "http://localhost:4000/api/v1/dictionary/search?query=你好"
```

## Конфигурация мобильного приложения

Убедитесь, что в `mobile/constants/config.ts` правильно настроены URL:

```typescript
// Для iOS Simulator
const API_URL = 'http://localhost:4000/api/v1';
const GRAPHQL_URL = 'http://localhost:4002/graphql';

// Для Android Emulator
const API_URL = 'http://10.0.2.2:4000/api/v1';
const GRAPHQL_URL = 'http://10.0.2.2:4002/graphql';
```

## Создание тестового пользователя

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

## Возможные проблемы

### Порты уже заняты

```bash
# Проверьте какой процесс использует порт
lsof -i :4000
lsof -i :4002

# Остановите процесс
kill -9 <PID>
```

### База данных не запустилась

```bash
# Проверьте логи PostgreSQL
docker-compose logs postgres

# Пересоздайте контейнер
docker-compose down
docker-compose up -d postgres
```

### Redis ошибки подключения

```bash
# Проверьте статус Redis
docker-compose logs redis

# Пересоздайте контейнер
docker-compose restart redis
```

## Остановка сервисов

```bash
# Остановить все сервисы
docker-compose stop

# Остановить и удалить контейнеры
docker-compose down

# Остановить и удалить с данными
docker-compose down -v
```

## Полезные команды

```bash
# Просмотр всех запущенных контейнеров
docker-compose ps

# Перезапуск конкретного сервиса
docker-compose restart api-gateway

# Пересборка и запуск после изменений в коде
docker-compose up -d --build

# Подключение к БД
docker-compose exec postgres psql -U postgres -d chinese_guide

# Выполнение команд в контейнере
docker-compose exec api-gateway npm run migration:run
```

