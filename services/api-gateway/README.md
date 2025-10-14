# HanGuide API Gateway

Единая точка входа для всех микросервисов HanGuide.

## Функциональность

- ✅ Проксирование запросов к User Service и Dictionary Service
- ✅ JWT аутентификация
- ✅ Rate limiting с учетом тарифных планов
- ✅ CORS configuration
- ✅ Health checks
- ✅ Redis для кэширования и rate limiting

## Архитектура

```
Client → API Gateway (4000) → User Service (4002)
                            → Dictionary Service (4001)
                            → Redis (6379)
```

## API Endpoints

### Authentication (User Service Proxy)

#### POST /api/v1/auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER",
    "subscriptionTier": "FREE",
    "dailyRequestsUsed": 0,
    "dailyRequestsLimit": 50
  }
}
```

#### POST /api/v1/auth/login
Вход в систему

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### POST /api/v1/auth/refresh
Обновление токенов

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/v1/auth/me
Получение информации о текущем пользователе (требуется JWT)

**Headers:**
```
Authorization: Bearer <access-token>
```

#### POST /api/v1/auth/logout
Выход из системы (требуется JWT)

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Dictionary (Dictionary Service Proxy)

#### GET /api/v1/dictionary/search?q={query}&limit={limit}
Поиск иероглифов

**Query Parameters:**
- `q` (required): строка поиска
- `limit` (optional): количество результатов (по умолчанию 20)

**Response:**
```json
[
  {
    "id": "uuid",
    "simplified": "你好",
    "traditional": "你好",
    "pinyin": "nǐ hǎo",
    "frequency": 9999,
    "definitions": [
      {
        "translation": "привет, здравствуйте",
        "partOfSpeech": "приветствие"
      }
    ]
  }
]
```

#### GET /api/v1/dictionary/character/:id
Получение детальной информации об иероглифе

**Response:**
```json
{
  "id": "uuid",
  "simplified": "好",
  "traditional": "好",
  "pinyin": "hǎo",
  "radical": "女",
  "strokes": 6,
  "frequency": 9999,
  "definitions": [
    {
      "translation": "хороший, добрый",
      "partOfSpeech": "прилагательное",
      "order": 0
    }
  ],
  "examples": [
    {
      "chinese": "很好",
      "pinyin": "hěn hǎo",
      "translation": "очень хорошо"
    }
  ]
}
```

#### GET /api/v1/dictionary/analyze?text={text}
Разбор текста на иероглифы

**Query Parameters:**
- `text` (required): текст на китайском для анализа

**Response:**
```json
[
  {
    "position": 0,
    "character": "你",
    "pinyin": "nǐ",
    "definitions": ["ты, вы"]
  },
  {
    "position": 1,
    "character": "好",
    "pinyin": "hǎo",
    "definitions": ["хороший, хорошо"]
  }
]
```

#### GET /api/v1/dictionary/phrases/search?q={query}&limit={limit}
Поиск фраз и выражений

## Rate Limiting

API Gateway реализует многоуровневую систему лимитов:

### По тарифам (на основе JWT токена)

- **Анонимные пользователи**: 10 запросов/день
- **FREE tier**: 50 запросов/день
- **PREMIUM tier**: 10,000 запросов/день

### По IP (глобальный throttling)

- 100 запросов/минуту на один IP адрес

### Headers ответа

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1760420000
```

### Ошибка при превышении лимита

**Status: 429 Too Many Requests**

```json
{
  "statusCode": 429,
  "message": "Daily limit exceeded. Current tier: FREE. Limit: 50 requests per day.",
  "tier": "FREE",
  "limit": 50,
  "used": 51
}
```

## Health Checks

### GET /
Базовая информация о сервисе

**Response:**
```json
{
  "status": "ok",
  "service": "HanGuide API Gateway",
  "version": "1.0.0",
  "timestamp": "2025-10-14T05:30:00.000Z"
}
```

### GET /health
Детальная проверка здоровья

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-10-14T05:30:00.000Z"
}
```

## Переменные окружения

```env
# Service
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*

# Microservices
USER_SERVICE_URL=http://user-service:4002
DICTIONARY_SERVICE_URL=http://dictionary-service:4001

# Redis
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# JWT (должны совпадать с User Service)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

## Запуск

### Docker (рекомендуется)

```bash
docker-compose build api-gateway
docker-compose up -d api-gateway
docker-compose logs -f api-gateway
```

### Локально

```bash
cd services/api-gateway
npm install
npm run build
npm run start:dev
```

## Структура проекта

```
services/api-gateway/
├── src/
│   ├── auth/                   # Auth module (User Service proxy)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── dictionary/             # Dictionary module (Dictionary Service proxy)
│   │   ├── dictionary.controller.ts
│   │   ├── dictionary.service.ts
│   │   └── dictionary.module.ts
│   ├── guards/                 # Guards
│   │   ├── jwt-auth.guard.ts
│   │   └── rate-limit.guard.ts
│   ├── redis/                  # Redis module
│   ├── app.module.ts
│   ├── health.controller.ts
│   └── main.ts
├── Dockerfile
├── package.json
└── README.md
```

## Тестирование

### Регистрация
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","displayName":"Test User"}'
```

### Вход
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'
```

### Поиск иероглифов
```bash
curl "http://localhost:4000/api/v1/dictionary/search?q=你好"
```

### Поиск с JWT (учитывает rate limits)
```bash
curl "http://localhost:4000/api/v1/dictionary/search?q=好" \
  -H "Authorization: Bearer <your-token>"
```

## Безопасность

- JWT токены валидируются на каждом защищенном эндпоинте
- Rate limiting предотвращает DDoS и перегрузку
- CORS настроен для безопасного доступа из мобильного приложения
- Все пароли хешируются в User Service (bcrypt)
- Refresh токены хранятся в БД и могут быть отозваны

## Мониторинг

Рекомендуется добавить:
- Prometheus metrics
- ELK stack для логов
- Health check dashboard
- Alert system для критических ошибок

## Roadmap

- [ ] GraphQL Federation
- [ ] WebSocket support для real-time обновлений
- [ ] Circuit breaker для отказоустойчивости
- [ ] Request tracing (Jaeger/Zipkin)
- [ ] API versioning
- [ ] Swagger/OpenAPI документация
