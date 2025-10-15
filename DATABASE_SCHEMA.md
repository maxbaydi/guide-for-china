# Полная схема базы данных chinese_guide

## Обзор

База данных содержит **9 основных таблиц**, разделенных логически между двумя микросервисами:

### Dictionary Service (4 таблицы)
- `characters` - китайские иероглифы/слова
- `definitions` - определения и переводы
- `examples` - примеры использования
- `phrases` - фразы для русско-китайского поиска

### User Service (5 таблиц)
- `users` - пользователи системы
- `refresh_tokens` - токены обновления
- `collections` - коллекции пользователя
- `collection_items` - иероглифы в коллекциях

---

## Детальная структура таблиц

### 1. characters

**Назначение**: Хранение китайских иероглифов и слов с их базовой информацией.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| simplified | text | Упрощенное написание (уникальное) |
| traditional | text | Традиционное написание |
| pinyin | text | Пиньинь (транскрипция) |
| hskLevel | integer | Уровень HSK (1-6) |
| frequency | integer | Ранг частотности |
| searchVector | tsvector | Вектор для полнотекстового поиска |
| createdAt | timestamp | Дата создания |
| updatedAt | timestamp | Дата обновления |

**Индексы**:
- `characters_pkey` - PRIMARY KEY (id)
- `characters_simplified_key` - UNIQUE (simplified)
- `characters_simplified_idx` - btree (simplified)
- `characters_pinyin_idx` - btree (pinyin)
- `character_search_idx` - GIN (search_vector)
- `idx_characters_hsk_level` - btree (hskLevel)
- `idx_characters_frequency` - btree (frequency)
- `idx_characters_hsk_frequency` - btree (hskLevel, frequency)
- `idx_characters_simplified_pattern` - btree (simplified text_pattern_ops)
- `idx_characters_pinyin_pattern` - btree (pinyin text_pattern_ops)

**Связи**: 
- → definitions (один-ко-многим)
- → examples (один-ко-многим)

---

### 2. definitions

**Назначение**: Хранение переводов и определений иероглифов.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| characterId | text | FK на characters |
| translation | text | Перевод на русский |
| partOfSpeech | text | Часть речи (глагол, сущ.) |
| context | text | Контекст (перен., устар.) |
| order | integer | Порядок отображения |
| createdAt | timestamp | Дата создания |

**Индексы**:
- `definitions_pkey` - PRIMARY KEY (id)
- `definitions_characterId_idx` - btree (characterId)
- `idx_definitions_character_order` - btree (characterId, order)
- `idx_definitions_translation_gin` - GIN (to_tsvector('russian', translation))
- `idx_definitions_translation_pattern` - btree (translation text_pattern_ops)

**Связи**: 
- ← characters (многие-к-одному)

---

### 3. examples

**Назначение**: Примеры использования иероглифов в предложениях.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| characterId | text | FK на characters |
| chinese | text | Пример на китайском |
| pinyin | text | Пиньинь примера |
| russian | text | Перевод примера |
| source | text | Источник примера |
| createdAt | timestamp | Дата создания |

**Индексы**:
- `examples_pkey` - PRIMARY KEY (id)
- `examples_characterId_idx` - btree (characterId)
- `idx_examples_character_created` - btree (characterId, createdAt DESC)

**Связи**: 
- ← characters (многие-к-одному)

---

### 4. phrases

**Назначение**: Фразы для русско-китайского поиска (обратный словарь).

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| russian | text | Русская фраза |
| chinese | text | Китайская фраза |
| pinyin | text | Пиньинь фразы |
| context | text | Контекст использования |
| searchVector | tsvector | Вектор для поиска |
| createdAt | timestamp | Дата создания |
| updatedAt | timestamp | Дата обновления |

**Индексы**:
- `phrases_pkey` - PRIMARY KEY (id)
- `phrases_russian_idx` - btree (russian)
- `idx_phrases_search_vector` - GIN (search_vector)
- `idx_phrases_russian_gin` - GIN (to_tsvector('russian', russian))
- `idx_phrases_russian_pattern` - btree (russian text_pattern_ops)
- `idx_phrases_chinese_pattern` - btree (chinese text_pattern_ops)
- `idx_phrases_created` - btree (createdAt DESC)

---

### 5. users

**Назначение**: Пользователи системы с аутентификацией и статистикой.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| email | text | Email (уникальный) |
| username | text | Имя пользователя (уникальное) |
| passwordHash | text | Хеш пароля |
| displayName | text | Отображаемое имя |
| avatarUrl | text | URL аватара |
| provider | AuthProvider | Провайдер аутентификации |
| providerId | text | ID у провайдера |
| role | UserRole | Роль (USER, ADMIN, MODERATOR) |
| isActive | boolean | Активен ли пользователь |
| emailVerified | boolean | Подтвержден ли email |
| subscriptionTier | SubscriptionTier | Тип подписки (FREE, PREMIUM) |
| dailyRequestsUsed | integer | Использовано запросов сегодня |
| dailyRequestsLimit | integer | Лимит запросов в день |
| lastRequestReset | timestamp | Последний сброс лимита |
| searchCount | integer | Количество поисков |
| analysisCount | integer | Количество анализов |
| charactersLearned | integer | Выучено иероглифов |
| studyTimeMinutes | integer | Время обучения (минуты) |
| lastActiveAt | timestamp | Последняя активность |
| createdAt | timestamp | Дата регистрации |
| updatedAt | timestamp | Дата обновления |
| lastLoginAt | timestamp | Последний вход |

**Индексы**:
- `users_pkey` - PRIMARY KEY (id)
- `users_email_key` - UNIQUE (email)
- `users_username_key` - UNIQUE (username)
- `users_email_idx` - btree (email)
- `users_username_idx` - btree (username)
- `users_provider_providerId_idx` - btree (provider, providerId)
- `idx_users_last_active` - btree (lastActiveAt)
- `idx_users_created` - btree (createdAt)
- `idx_users_subscription_active` - btree (subscriptionTier, isActive)

**Связи**: 
- → refresh_tokens (один-ко-многим)
- → collections (один-ко-многим)

---

### 6. refresh_tokens

**Назначение**: Refresh токены для обновления access токенов.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| token | text | Токен (уникальный) |
| userId | text | FK на users |
| expiresAt | timestamp | Дата истечения |
| createdAt | timestamp | Дата создания |

**Индексы**:
- `refresh_tokens_pkey` - PRIMARY KEY (id)
- `refresh_tokens_token_key` - UNIQUE (token)
- `refresh_tokens_userId_idx` - btree (userId)
- `refresh_tokens_token_idx` - btree (token)

**Связи**: 
- ← users (многие-к-одному, каскадное удаление)

---

### 7. collections

**Назначение**: Коллекции пользователя для организации иероглифов.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| userId | text | FK на users |
| name | text | Название коллекции |
| description | text | Описание |
| color | text | Цвет (hex) для UI |
| icon | text | Иконка или emoji |
| isPublic | boolean | Публичная ли коллекция |
| sortOrder | integer | Порядок сортировки |
| createdAt | timestamp | Дата создания |
| updatedAt | timestamp | Дата обновления |

**Индексы**:
- `collections_pkey` - PRIMARY KEY (id)
- `collections_userId_idx` - btree (userId)
- `collections_userId_sortOrder_idx` - btree (userId, sortOrder)
- `idx_collections_user_created` - btree (userId, createdAt DESC)
- `idx_collections_public` - btree (isPublic) WHERE isPublic = true

**Связи**: 
- ← users (многие-к-одному, каскадное удаление)
- → collection_items (один-ко-многим)

---

### 8. collection_items

**Назначение**: Связь many-to-many между коллекциями и иероглифами.

| Поле | Тип | Описание |
|------|-----|----------|
| id | text (UUID) | Уникальный идентификатор |
| collectionId | text | FK на collections |
| characterId | text | Мягкая ссылка на character |
| notes | text | Заметки пользователя |
| addedAt | timestamp | Дата добавления |
| sortOrder | integer | Порядок в коллекции |

**Индексы**:
- `collection_items_pkey` - PRIMARY KEY (id)
- `collection_items_collectionId_characterId_key` - UNIQUE (collectionId, characterId)
- `collection_items_collectionId_idx` - btree (collectionId)
- `collection_items_characterId_idx` - btree (characterId)
- `idx_collection_items_added` - btree (collectionId, addedAt DESC)

**Связи**: 
- ← collections (многие-к-одному, каскадное удаление)
- ~ characters (мягкая ссылка, нет FK для микросервисов)

**Примечание**: `characterId` НЕ имеет foreign key constraint, чтобы сохранить независимость микросервисов.

---

## Перечисления (ENUMs)

### AuthProvider
```sql
'EMAIL' | 'GOOGLE' | 'APPLE'
```

### UserRole
```sql
'USER' | 'ADMIN' | 'MODERATOR'
```

### SubscriptionTier
```sql
'FREE' | 'PREMIUM'
```

---

## Диаграмма связей

```
users (1) ─────< (N) refresh_tokens
  |
  └───────< (N) collections
                   |
                   └───────< (N) collection_items ~~> characters (мягкая связь)
                                                            |
                                                            ├────< (N) definitions
                                                            └────< (N) examples

phrases (независимая таблица)
```

---

## Особенности архитектуры

### 1. Полнотекстовый поиск
- Используется **pg_jieba** для китайского текста
- GIN индексы на `search_vector` полях
- Триггеры для автоматического обновления векторов

### 2. Микросервисная архитектура
- **Мягкие ссылки** между сервисами (collection_items.characterId)
- Нет FK между микросервисами для независимости
- Общая база данных с логическим разделением

### 3. Производительность
- Композитные индексы для частых запросов
- Text pattern ops для LIKE запросов
- Каскадное удаление для чистоты данных
- Партиционирование по дате (будущее расширение)

### 4. Безопасность
- Хеширование паролей (bcrypt)
- Токены обновления с истечением
- Rate limiting на уровне пользователя
- Мягкое удаление (isActive флаг)

---

## Миграции

Миграции находятся в:
- `infrastructure/postgres/migrations/`

Применяются через Docker:
```bash
docker exec guide-postgres psql -U postgres -d chinese_guide -f /path/to/migration.sql
```

---

## Статистика базы данных (по состоянию на 15.10.2025)

### Количество записей

| Таблица | Количество записей | Описание |
|---------|-------------------|----------|
| examples | 15,259,481 | 15.2 млн примеров использования |
| definitions | 3,602,390 | 3.6 млн определений |
| characters | 3,420,720 | 3.4 млн иероглифов |
| phrases | 245,702 | 245k фраз |
| refresh_tokens | 29 | Активные токены |
| collection_items | 15 | Иероглифы в коллекциях |
| collections | 8 | Коллекции пользователей |
| users | 8 | Зарегистрированные пользователи |

### Размеры таблиц

| Таблица | Размер | Процент |
|---------|--------|---------|
| examples | 7077 MB | 71% |
| definitions | 1510 MB | 15% |
| characters | 1205 MB | 12% |
| phrases | 179 MB | 2% |
| Остальные | <1 MB | <1% |
| **ИТОГО** | **~10 GB** | 100% |

### Запросы для получения статистики

```sql
-- Размер таблиц
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Количество записей (приблизительно)
SELECT relname, n_live_tup 
FROM pg_stat_user_tables 
WHERE schemaname='public' 
ORDER BY n_live_tup DESC;

-- Точное количество (медленнее)
SELECT COUNT(*) FROM characters;
```

---

**Обновлено**: 2025-10-15  
**Версия схемы**: 1.0.0

