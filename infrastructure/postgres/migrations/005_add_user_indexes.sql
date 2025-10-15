-- Миграция для добавления индексов в User БД
-- Только индексы, без изменения структуры данных

-- ============================================
-- Индексы для таблицы users
-- ============================================

-- Индекс для аналитики активности пользователей
CREATE INDEX IF NOT EXISTS idx_users_last_active 
ON users ("lastActiveAt");

-- Индекс для аналитики регистраций
CREATE INDEX IF NOT EXISTS idx_users_created 
ON users ("createdAt");

-- Композитный индекс для фильтрации активных пользователей по подписке
CREATE INDEX IF NOT EXISTS idx_users_subscription_active 
ON users ("subscriptionTier", "isActive");

-- ============================================
-- Индексы для таблицы collections
-- ============================================

-- Композитный индекс для сортировки коллекций пользователя по дате создания
CREATE INDEX IF NOT EXISTS idx_collections_user_created 
ON collections ("userId", "createdAt" DESC);

-- Индекс для поиска публичных коллекций
CREATE INDEX IF NOT EXISTS idx_collections_public 
ON collections ("isPublic")
WHERE "isPublic" = true;

-- ============================================
-- Индексы для таблицы collection_items
-- ============================================

-- Композитный индекс для сортировки элементов коллекции по дате добавления
CREATE INDEX IF NOT EXISTS idx_collection_items_added 
ON collection_items ("collectionId", "addedAt" DESC);

-- ============================================
-- Обновление статистики для планировщика
-- ============================================

ANALYZE users;
ANALYZE collections;
ANALYZE collection_items;
ANALYZE refresh_tokens;

-- Комментарии
COMMENT ON INDEX idx_users_last_active IS 'Индекс для аналитики активности пользователей';
COMMENT ON INDEX idx_users_created IS 'Индекс для аналитики регистраций';
COMMENT ON INDEX idx_users_subscription_active IS 'Индекс для фильтрации пользователей по подписке и статусу';
COMMENT ON INDEX idx_collections_user_created IS 'Индекс для сортировки коллекций пользователя по дате';
COMMENT ON INDEX idx_collections_public IS 'Индекс для поиска публичных коллекций';
COMMENT ON INDEX idx_collection_items_added IS 'Индекс для сортировки элементов коллекции';

