-- Initialize PostgreSQL with pg_jieba extension for Chinese text search
-- This script runs automatically when the PostgreSQL container starts

-- Create pg_jieba extension
-- Note: pg_jieba needs to be pre-installed in the PostgreSQL image
-- We'll use a custom Dockerfile for this

-- For now, this script will be used for any initial setup
-- The actual pg_jieba extension will be created after migrations

-- Create database if not exists (handled by environment variables)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Для нормализации пиньиня

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE chinese_guide TO postgres;

-- ============================================
-- Функция нормализации пиньиня
-- ============================================
-- Убирает тоны и приводит к lowercase для корректного поиска
-- Используется в функциях поиска

CREATE OR REPLACE FUNCTION normalize_pinyin(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN '';
  END IF;
  
  RETURN LOWER(
    -- Используем unaccent для удаления диакритических знаков
    TRIM(
      REGEXP_REPLACE(
        unaccent(
          -- Замена ü на v ПЕРЕД unaccent
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(input_text, 'ü', 'v'),
                  'ǖ', 'v'
                ),
                'ǘ', 'v'
              ),
              'ǚ', 'v'
            ),
            'ǜ', 'v'
          )
        ),
        '[0-9]', -- Удаляем числовые обозначения тонов (1-5)
        '',
        'g'
      )
    )
  );
END;
$$;

COMMENT ON FUNCTION normalize_pinyin IS 
'Нормализует пиньинь для поиска: убирает тоны, приводит к lowercase.
Примеры: "xué" → "xue", "shànghǎi" → "shanghai", "nǐhǎo" → "nihao"';

-- Note: pg_jieba extension will be created in migrations after Dictionary Service setup

