# Оптимизация производительности: Индексы и кеширование

## ✅ Выполненные работы

### 1. Исправление слова дня
- ✅ Исправлен SQL запрос в `services/dictionary/src/services/dictionary.service.ts`
  - Изменено имя таблицы: `chinese_characters` → `characters`
  - Изменено имя колонки: `hsk_level` → `"hskLevel"`
  - Слово дня теперь будет корректно отображаться

### 2. Индексы базы данных

#### Dictionary БД (`infrastructure/postgres/migrations/004_add_performance_indexes.sql`)
Созданы следующие индексы:

**Для таблицы characters:**
- GIN индекс на `search_vector` для полнотекстового поиска
- Индекс на `hskLevel` для фильтрации по уровню HSK
- Индекс на `frequency` для сортировки
- Композитный индекс `(hskLevel, frequency)`
- Улучшенные индексы для `simplified` и `pinyin` с `text_pattern_ops`

**Для таблицы definitions:**
- GIN индекс для полнотекстового поиска по переводам (русский)
- Индекс для ILIKE поиска по переводам
- Композитный индекс `(characterId, order)` для сортировки

**Для таблицы examples:**
- Композитный индекс `(characterId, createdAt)` для сортировки

**Для таблицы phrases:**
- GIN индексы для полнотекстового поиска
- Индексы для ILIKE поиска
- Индекс на `createdAt` для сортировки

#### User БД (обновлен Prisma schema)
Добавлены индексы в `services/user/prisma/schema.prisma`:

**Для таблицы users:**
- `@@index([lastActiveAt])` - для аналитики активности
- `@@index([createdAt])` - для аналитики регистраций
- `@@index([subscriptionTier, isActive])` - для фильтрации

**Для таблицы collections:**
- `@@index([userId, createdAt])` - для сортировки коллекций
- `@@index([isPublic])` - для поиска публичных коллекций

**Для таблицы collection_items:**
- `@@index([collectionId, addedAt])` - для сортировки элементов

### 3. Кеширование в Redis

#### Dictionary Service Redis
Создана полноценная система кеширования:

**Файлы:**
- `services/dictionary/src/redis/redis.module.ts` - модуль Redis
- `services/dictionary/src/redis/redis.service.ts` - сервис кеширования

**Методы кеширования:**
- `searchCharacters` - кеш на 5 минут (300 сек)
- `getCharacter` - кеш на 1 час (3600 сек)
- `wordOfTheDay` - кеш на 24 часа (86400 сек)
- `analyzeText` - кеш на 30 минут (1800 сек)
- `searchPhrases` - кеш на 5 минут (300 сек)

**Ключи кеша:**
- `search:{query}:{limit}` - результаты поиска
- `character:{id}` - детали иероглифа
- `word-of-day:{YYYY-MM-DD}` - слово дня с датой
- `analysis:{text}` - результаты анализа текста
- `phrase-search:{query}:{limit}` - результаты поиска фраз

### 4. Интеграция

- ✅ Добавлен `@nestjs/config` в Dictionary Service
- ✅ Добавлен `ioredis` в зависимости
- ✅ RedisModule интегрирован в DictionaryModule
- ✅ Все методы DictionaryService используют кеширование
- ✅ Обновлен docker-compose.yml с переменными Redis
- ✅ Добавлены зависимости Redis для Dictionary и User сервисов

## 📋 Инструкции по применению

### Шаг 1: Применить миграции для Dictionary БД

```bash
# Зайти в контейнер PostgreSQL или выполнить локально
psql -U postgres -d chinese_guide -f infrastructure/postgres/migrations/004_add_performance_indexes.sql
```

Или через Docker:
```bash
docker exec -i guide-postgres psql -U postgres -d chinese_guide < infrastructure/postgres/migrations/004_add_performance_indexes.sql
```

### Шаг 2: Создать миграцию для User БД

```bash
cd services/user
npx prisma migrate dev --name add_performance_indexes
```

Это создаст миграцию на основе изменений в `schema.prisma`.

### Шаг 3: Установить зависимости для Dictionary Service

```bash
cd services/dictionary
npm install
```

### Шаг 4: Перезапустить сервисы

```bash
# Остановить и пересобрать сервисы
docker-compose down
docker-compose up --build -d

# Или только Dictionary Service
docker-compose up --build -d dictionary-service
```

### Шаг 5: Проверить логи

```bash
# Проверить подключение Redis в Dictionary Service
docker-compose logs -f dictionary-service

# Должно появиться сообщение:
# ✅ Redis connected in Dictionary Service

# Проверить работу кеширования
docker-compose logs -f dictionary-service | grep Cache
```

## 🧪 Тестирование

### 1. Проверка слова дня

Открыть мобильное приложение и перейти на страницу поиска. Должно отображаться "Слово дня" с иероглифом, пиньинем и переводом.

### 2. Проверка индексов

```sql
-- Подключиться к БД
psql -U postgres -d chinese_guide

-- Проверить созданные индексы
\di

-- Проверить использование индексов
EXPLAIN ANALYZE SELECT * FROM characters WHERE "hskLevel" BETWEEN 1 AND 3;
```

### 3. Проверка кеширования

```bash
# Первый запрос (должен быть медленнее)
curl "http://localhost:4000/api/v1/dictionary/search?query=你好"

# Второй запрос (должен быть быстрее)
curl "http://localhost:4000/api/v1/dictionary/search?query=你好"

# Проверить логи кеша
docker-compose logs dictionary-service | grep "Cache hit"
docker-compose logs dictionary-service | grep "Cache miss"
```

### 4. Проверка Redis

```bash
# Зайти в Redis CLI
docker exec -it guide-redis redis-cli

# Проверить ключи
KEYS *

# Проверить TTL ключа
TTL "search:你好:20"

# Проверить содержимое
GET "word-of-day:2025-10-15"
```

## 📊 Ожидаемые результаты

### Производительность

**До оптимизации:**
- Поиск: ~100-500ms
- Получение иероглифа: ~50-100ms
- Анализ текста: ~200-1000ms (зависит от длины)

**После оптимизации:**
- Поиск (первый раз): ~50-200ms (благодаря индексам)
- Поиск (из кеша): ~1-5ms
- Получение иероглифа (первый раз): ~20-50ms
- Получение иероглифа (из кеша): ~1-2ms
- Анализ текста (первый раз): ~100-500ms
- Анализ текста (из кеша): ~1-5ms
- Слово дня (из кеша): ~1-2ms

### Снижение нагрузки на БД

- Поиск: снижение на 80-90% для популярных запросов
- Получение иероглифа: снижение на 90-95%
- Слово дня: снижение на 99% (1 запрос в день вместо тысяч)

## 🔧 Мониторинг

### Redis статистика

```bash
# Зайти в Redis CLI
docker exec -it guide-redis redis-cli

# Общая информация
INFO stats

# Использование памяти
INFO memory

# Количество ключей
DBSIZE
```

### Очистка кеша

```bash
# Очистить весь кеш
docker exec -it guide-redis redis-cli FLUSHALL

# Очистить кеш поиска
docker exec -it guide-redis redis-cli --scan --pattern 'search:*' | xargs redis-cli DEL

# Очистить кеш слова дня
docker exec -it guide-redis redis-cli DEL "word-of-day:$(date +%Y-%m-%d)"
```

## 📝 Примечания

1. **Индексы занимают место:** Новые индексы могут увеличить размер БД на 10-20%
2. **Redis память:** Кеш будет занимать ~100-500MB RAM при активном использовании
3. **TTL кеша:** Настроенные значения TTL можно изменить в `redis.service.ts`
4. **Инвалидация кеша:** При обновлении данных в БД нужно будет очищать соответствующий кеш

## 🎯 Следующие шаги

1. Мониторинг производительности в production
2. Настройка политик очистки Redis (LRU, LFU)
3. Добавление метрик в Prometheus/Grafana
4. Оптимизация TTL значений на основе реальных данных использования

