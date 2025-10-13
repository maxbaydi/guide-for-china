# API Gateway - Текущий статус

## ✅ Что реализовано

### 1. Базовая структура API Gateway
- ✅ NestJS проект создан
- ✅ Зависимости установлены
- ✅ Конфигурация через `.env`
- ✅ Сборка проекта успешна

### 2. Интеграция Redis
- ✅ RedisModule создан
- ✅ RedisService с методами get/set/del/incr
- ✅ Подключение к Redis на localhost:6379
- ✅ Обработка ошибок подключения

### 3. Rate Limiting
- ✅ @nestjs/throttler интегрирован
- ✅ CustomThrottlerGuard с поддержкой userId
- ✅ Настройки через environment variables

### 4. Health Check
- ✅ `/health` endpoint
- ✅ Базовый контроллер

## ⚠️ Что нужно доработать

### Apollo Federation
**Проблема:** Dictionary Service не настроен как Apollo Federation subgraph, поэтому Apollo Gateway не может его подключить.

**Решение (на выбор):**

#### Вариант 1: Простой HTTP прокси (рекомендуется для MVP)
Создать простые resolver'ы в API Gateway, которые делают HTTP запросы к Dictionary Service:

```typescript
@Resolver()
export class DictionaryProxyResolver {
  async searchCharacters(query: string) {
    const response = await axios.post('http://localhost:3001/graphql', {
      query: `query { searchCharacters(query: "${query}") { ... } }`
    });
    return response.data.data.searchCharacters;
  }
}
```

#### Вариант 2: Apollo Federation (для production)
1. Добавить `@apollo/subgraph` в Dictionary Service
2. Добавить Federation директивы к GraphQL схеме
3. Настроить Apollo Gateway правильно

## 📝 Текущая архитектура

```
┌─────────────────┐
│  Mobile App     │
│ (React Native)  │
└────────┬────────┘
         │
         │ HTTP/GraphQL
         ▼
┌─────────────────┐
│  API Gateway    │  ← Порт 3000
│  (NestJS)       │
└────────┬────────┘
         │
         │ (пока напрямую)
         ▼
┌─────────────────┐
│ Dictionary      │  ← Порт 3001
│ Service         │
│ (NestJS)        │
└─────────────────┘
```

## 🚀 Следующие шаги

### Немедленные (для MVP):
1. **Решить вопрос с Gateway:**
   - Использовать Dictionary Service напрямую на порту 3001
   - Или создать простые прокси-резолверы в API Gateway

### Средний срок:
2. **Настроить Apollo Federation** (когда будут готовы User и Subscription сервисы)
3. **Добавить кэширование** популярных запросов через Redis
4. **Добавить JWT middleware** для аутентификации

### Долгосрочные:
5. **Мониторинг и логирование**
6. **Metrics и tracing**
7. **GraphQL persisted queries**

## 💡 Рекомендация

**Для текущего MVP предлагаю:**
- Оставить Dictionary Service доступным напрямую на порту 3001
- API Gateway использовать только для:
  - Rate limiting
  - Аутентификации (когда появится User Service)
  - Кэширования
- Позже, когда появятся User и Subscription сервисы, настроить полноценный Apollo Federation

Это позволит нам быстро двигаться вперед и не застревать на настройке Federation для одного сервиса.

## 📊 Текущие сервисы

| Сервис | Порт | Статус | GraphQL Playground |
|--------|------|--------|-------------------|
| Dictionary Service | 3001 | ✅ Работает | http://localhost:3001/graphql |
| API Gateway | 3000 | ⚠️ Требует доработки | - |
| PostgreSQL | 5432 | ✅ Работает | - |
| Redis | 6379 | ✅ Работает | - |

## 🎯 Что работает прямо сейчас

**Dictionary Service (http://localhost:3001/graphql):**
- ✅ `searchCharacters(query, limit)` 
- ✅ `getCharacter(id)`
- ✅ `getCharacterBySimplified(simplified)`
- ✅ `searchPhrases(query, limit)`
- ✅ `analyzeText(text)`

**Примеры запросов:**
```graphql
# Получить иероглиф
{
  getCharacterBySimplified(simplified: "你") {
    simplified
    pinyin
    definitions {
      translation
    }
  }
}

# Разобрать текст
{
  analyzeText(text: "我学习中文") {
    character
    position
    details {
      simplified
      pinyin
      definitions {
        translation
      }
    }
  }
}
```

