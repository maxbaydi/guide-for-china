-- Миграция для добавления индексов производительности
-- Цель: ускорение поиска, анализа и кеширования

-- ============================================
-- Индексы для таблицы characters
-- ============================================

-- GIN индекс для полнотекстового поиска (если используется searchVector)
CREATE INDEX IF NOT EXISTS idx_characters_search_vector 
ON characters USING GIN (search_vector)
WHERE search_vector IS NOT NULL;

-- Индекс для фильтрации по уровню HSK
CREATE INDEX IF NOT EXISTS idx_characters_hsk_level 
ON characters ("hskLevel")
WHERE "hskLevel" IS NOT NULL;

-- Индекс для сортировки по частотности
CREATE INDEX IF NOT EXISTS idx_characters_frequency 
ON characters (frequency)
WHERE frequency IS NOT NULL;

-- Композитный индекс для комбинированных запросов по HSK и частотности
CREATE INDEX IF NOT EXISTS idx_characters_hsk_frequency 
ON characters ("hskLevel", frequency)
WHERE "hskLevel" IS NOT NULL AND frequency IS NOT NULL;

-- Индекс для поиска по упрощенному написанию (уже есть через @@index в Prisma, но улучшим)
CREATE INDEX IF NOT EXISTS idx_characters_simplified_pattern 
ON characters (simplified text_pattern_ops);

-- Индекс для поиска по пиньиню (улучшенный для ILIKE)
CREATE INDEX IF NOT EXISTS idx_characters_pinyin_pattern 
ON characters (pinyin text_pattern_ops)
WHERE pinyin IS NOT NULL;

-- ============================================
-- Индексы для таблицы definitions
-- ============================================

-- GIN индекс для полнотекстового поиска по переводам
CREATE INDEX IF NOT EXISTS idx_definitions_translation_gin 
ON definitions USING GIN (to_tsvector('russian', translation));

-- Индекс для поиска по переводу с использованием ILIKE
CREATE INDEX IF NOT EXISTS idx_definitions_translation_pattern 
ON definitions (translation text_pattern_ops);

-- Композитный индекс для сортировки определений по иероглифу
CREATE INDEX IF NOT EXISTS idx_definitions_character_order 
ON definitions ("characterId", "order");

-- ============================================
-- Индексы для таблицы examples
-- ============================================

-- Индекс для быстрого получения примеров по иероглифу
-- (уже есть базовый, но добавим оптимизацию если нужна сортировка)
CREATE INDEX IF NOT EXISTS idx_examples_character_created 
ON examples ("characterId", "createdAt" DESC);

-- ============================================
-- Индексы для таблицы phrases
-- ============================================

-- GIN индекс для полнотекстового поиска фраз
CREATE INDEX IF NOT EXISTS idx_phrases_search_vector 
ON phrases USING GIN (search_vector)
WHERE search_vector IS NOT NULL;

-- GIN индекс для полнотекстового поиска по русскому тексту
CREATE INDEX IF NOT EXISTS idx_phrases_russian_gin 
ON phrases USING GIN (to_tsvector('russian', russian));

-- Индекс для поиска по русскому тексту с ILIKE
CREATE INDEX IF NOT EXISTS idx_phrases_russian_pattern 
ON phrases (russian text_pattern_ops);

-- Индекс для поиска по китайскому тексту
CREATE INDEX IF NOT EXISTS idx_phrases_chinese_pattern 
ON phrases (chinese text_pattern_ops);

-- Индекс для сортировки фраз
CREATE INDEX IF NOT EXISTS idx_phrases_created 
ON phrases ("createdAt" DESC);

-- ============================================
-- Обновление статистики для планировщика
-- ============================================

ANALYZE characters;
ANALYZE definitions;
ANALYZE examples;
ANALYZE phrases;

-- Комментарии
COMMENT ON INDEX idx_characters_search_vector IS 'GIN индекс для полнотекстового поиска иероглифов';
COMMENT ON INDEX idx_characters_hsk_level IS 'Индекс для фильтрации по уровню HSK';
COMMENT ON INDEX idx_characters_frequency IS 'Индекс для сортировки по частотности';
COMMENT ON INDEX idx_characters_hsk_frequency IS 'Композитный индекс для запросов по HSK и частотности';
COMMENT ON INDEX idx_definitions_translation_gin IS 'GIN индекс для полнотекстового поиска по переводам';
COMMENT ON INDEX idx_phrases_russian_gin IS 'GIN индекс для полнотекстового поиска фраз по русскому тексту';

