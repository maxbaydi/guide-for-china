# Чеклист тестирования оптимизаций

## ✅ Проверка индексов БД

### Dictionary БД
```bash
docker exec -i guide-postgres psql -U postgres -d chinese_guide -c "\di" | grep "idx_"
```

**Ожидаемый результат**: Список из 15 индексов (idx_characters_, idx_definitions_, idx_examples_, idx_phrases_)

### User БД
```bash
docker exec -i guide-postgres psql -U postgres -d chinese_guide -c "\di" | grep "idx_users\|idx_collections"
```

**Ожидаемый результат**: 6 новых индексов для users, collections, collection_items

## ✅ Проверка Redis

### Подключение
```bash
docker-compose logs dictionary-service | grep "Redis connected"
```

**Ожидаемый результат**: `✅ Redis connected in Dictionary Service`

### Статус Redis
```bash
docker-compose ps redis
```

**Ожидаемый результат**: Status `Up` (healthy)

## ✅ Проверка кеширования

### 1. Слово дня

```bash
# Первый запрос (cache miss)
curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { wordOfTheDay { id simplified pinyin definitions { translation } } }"}'
```

**Проверить логи**:
```bash
docker-compose logs dictionary-service | tail -5
```

**Ожидается**: `Cache miss for word of the day, generating new one`

```bash
# Второй запрос (cache hit)
curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { wordOfTheDay { id simplified pinyin } }"}'
```

**Проверить логи**:
```bash
docker-compose logs dictionary-service | tail -3
```

**Ожидается**: `Cache hit for word of the day`

### 2. Поиск иероглифов

```bash
# Первый запрос (cache miss)
curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { searchCharacters(query: \"你好\", limit: 5) { id simplified pinyin } }"}'
```

**Проверить логи**: `Cache miss for search: 你好`

```bash
# Второй запрос (cache hit)
curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { searchCharacters(query: \"你好\", limit: 5) { id simplified pinyin } }"}'
```

**Проверить логи**: `Cache hit for search: 你好`

### 3. Получение иероглифа

```bash
# Получить ID любого иероглифа
ID=$(curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { searchCharacters(query: \"的\", limit: 1) { id } }"}' \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Первый запрос
curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query { getCharacter(id: \\\"$ID\\\") { id simplified pinyin } }\"}"
```

**Проверить логи**: `Cache miss for character`

```bash
# Второй запрос
curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query { getCharacter(id: \\\"$ID\\\") { id simplified pinyin } }\"}"
```

**Проверить логи**: `Cache hit for character`

## ✅ Проверка Redis ключей

```bash
docker exec -it guide-redis redis-cli KEYS "*"
```

**Ожидаемые ключи**:
- `word-of-day:2025-10-15` (или текущая дата)
- `search:*` (ключи поиска)
- `character:*` (ключи иероглифов)

```bash
# Проверить TTL слова дня
docker exec -it guide-redis redis-cli TTL "word-of-day:$(date +%Y-%m-%d)"
```

**Ожидается**: ~86400 секунд (24 часа)

```bash
# Проверить TTL поиска
docker exec -it guide-redis redis-cli KEYS "search:*" | head -1 | xargs -I {} docker exec -it guide-redis redis-cli TTL {}
```

**Ожидается**: ~300 секунд (5 минут)

## ✅ Проверка производительности

### До и после (приблизительно)

```bash
# Измерить время ответа (первый раз)
time curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { searchCharacters(query: \"你好\", limit: 10) { id } }"}'

# Измерить время ответа (из кеша)
time curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { searchCharacters(query: \"你好\", limit: 10) { id } }"}'
```

**Ожидается**:
- Первый запрос: 50-200ms
- Второй запрос (кеш): 1-10ms (значительно быстрее)

## ✅ Проверка мобильного приложения

1. **Запустить мобильное приложение**
2. **Перейти на вкладку "Поиск"**
3. **Проверить отображение "Слово дня"**

**Ожидается**:
- ✅ Карточка "Слово дня" отображается
- ✅ Показан иероглиф
- ✅ Показан пиньинь
- ✅ Показан перевод
- ✅ По клику открывается детальная страница иероглифа

## ✅ Статистика Redis

```bash
docker exec -it guide-redis redis-cli INFO stats
```

**Проверить**:
- `keyspace_hits` - количество попаданий в кеш
- `keyspace_misses` - количество промахов

```bash
docker exec -it guide-redis redis-cli INFO memory
```

**Проверить**:
- `used_memory_human` - используемая память

## 🔧 Очистка кеша (если нужно)

```bash
# Очистить весь кеш
docker exec -it guide-redis redis-cli FLUSHALL

# Очистить только кеш поиска
docker exec -it guide-redis redis-cli KEYS "search:*" | xargs docker exec -it guide-redis redis-cli DEL

# Очистить слово дня
docker exec -it guide-redis redis-cli DEL "word-of-day:$(date +%Y-%m-%d)"
```

## 📊 Мониторинг в реальном времени

```bash
# Смотреть логи в реальном времени
docker-compose logs -f dictionary-service | grep -E "(Cache|word of the day|search)"

# Мониторить Redis
docker exec -it guide-redis redis-cli MONITOR
```

## ✅ Финальная проверка

- [ ] Индексы БД созданы (21 индекс)
- [ ] Redis подключен к Dictionary Service
- [ ] Кеширование работает (cache hit/miss в логах)
- [ ] Слово дня отображается в приложении
- [ ] Поиск работает быстрее
- [ ] Повторные запросы обрабатываются мгновенно
- [ ] Redis ключи создаются и имеют правильный TTL

## 🎉 Если все проверки пройдены

Оптимизация выполнена успешно! 🚀

Приложение готово к production с:
- ⚡ Ускоренным поиском (2-3x)
- ⚡⚡ Молниеносным кешем (50-100x)
- 📉 Сниженной нагрузкой на БД (70-90%)
- 🎯 Рабочим словом дня

