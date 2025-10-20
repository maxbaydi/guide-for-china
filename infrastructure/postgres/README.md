# Database Schema Backup

Полный слепок схемы базы данных Chinese Guide для воссоздания на другом сервере.

## Файлы

- `schema_dump.sql` - Полный SQL dump схемы (49KB)
- `schema_restore.sh` - Скрипт для восстановления схемы
- `README.md` - Данная инструкция

## Что включено в dump

### Расширения PostgreSQL
- `pg_jieba` - Китайская сегментация текста (критически важно)
- `pg_trgm` - Триграммный поиск для нечеткого поиска
- `unaccent` - Нормализация диакритических знаков
- `uuid-ossp` - Генерация UUID

### Таблицы
- `users` - Пользователи системы
- `refresh_tokens` - Токены обновления
- `collections` - Коллекции пользователей
- `collection_items` - Элементы коллекций
- `characters` - Китайские иероглифы
- `definitions` - Определения иероглифов
- `examples` - Примеры использования
- `phrases` - Русско-китайские фразы

### Функции поиска
- `normalize_pinyin()` - Нормализация пиньиня
- `search_exact()` - Точный поиск
- `search_prefix()` - Поиск по префиксу
- `search_fuzzy()` - Нечеткий поиск
- `search_enhanced()` - Расширенный поиск
- `search_enhanced_detailed()` - Детальный поиск
- `search_chinese_characters()` - Поиск иероглифов
- `search_phrases()` - Поиск фраз

### Индексы
- Все первичные и внешние ключи
- GIN индексы для полнотекстового поиска
- GIN индексы для триграммного поиска
- Композитные индексы производительности
- Индексы для сортировки и фильтрации

### Типы данных
- `AuthProvider` (EMAIL, GOOGLE, APPLE)
- `UserRole` (USER, ADMIN, MODERATOR)
- `SubscriptionTier` (FREE, PREMIUM)

## Восстановление схемы

### Требования
- PostgreSQL 14+ (рекомендуется 16+)
- Расширение `pg_jieba` (обязательно для китайского поиска)
- Расширения `pg_trgm`, `unaccent`, `uuid-ossp`

### Автоматическое восстановление

```bash
# Сделать скрипт исполняемым
chmod +x schema_restore.sh

# Восстановить схему
./schema_restore.sh <HOST> <PORT> <DATABASE_NAME> [USERNAME] [PASSWORD]

# Примеры
./schema_restore.sh localhost 5432 chinese_guide postgres postgres
./schema_restore.sh db.example.com 5432 chinese_guide myuser mypass
```

### Ручное восстановление

```bash
# Создать базу данных
createdb -h <HOST> -p <PORT> -U <USERNAME> <DATABASE_NAME>

# Установить расширения
psql -h <HOST> -p <PORT> -U <USERNAME> -d <DATABASE_NAME> -c "CREATE EXTENSION IF NOT EXISTS pg_jieba;"
psql -h <HOST> -p <PORT> -U <USERNAME> -d <DATABASE_NAME> -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql -h <HOST> -p <PORT> -U <USERNAME> -d <DATABASE_NAME> -c "CREATE EXTENSION IF NOT EXISTS unaccent;"
psql -h <HOST> -p <PORT> -U <USERNAME> -d <DATABASE_NAME> -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"

# Восстановить схему
psql -h <HOST> -p <PORT> -U <USERNAME> -d <DATABASE_NAME> -f schema_dump.sql
```

## Проверка восстановления

```sql
-- Проверить таблицы
\dt

-- Проверить расширения
SELECT * FROM pg_extension;

-- Проверить функции поиска
SELECT proname FROM pg_proc WHERE proname LIKE 'search_%' OR proname LIKE 'normalize_%';

-- Проверить индексы
SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';

-- Тест поиска
SELECT search_enhanced('你好', 'exact', 10);
```

## Важные замечания

1. **pg_jieba критически важен** - без него китайский поиск работать не будет
2. **Версия PostgreSQL** - рекомендуется 14+ для полной совместимости
3. **Права доступа** - настройте права пользователя после восстановления
4. **Производительность** - все индексы созданы для оптимальной работы

## Поддержка

При проблемах с восстановлением проверьте:
- Версию PostgreSQL (должна быть 14+)
- Наличие всех расширений
- Права доступа пользователя
- Логи ошибок PostgreSQL

## Дата создания

Создано: 19 октября 2025
Версия схемы: Полная схема Chinese Guide
Размер dump: ~49KB

