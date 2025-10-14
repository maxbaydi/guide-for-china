-- Улучшенная функция поиска с поддержкой русского языка
DROP FUNCTION IF EXISTS search_chinese_characters(text, integer);

CREATE OR REPLACE FUNCTION search_chinese_characters(search_query text, result_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, simplified text, traditional text, pinyin text, rank real)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::uuid,
    c.simplified,
    c.traditional,
    c.pinyin,
    COALESCE(
      MAX(ts_rank(to_tsvector('russian', d.translation), plainto_tsquery('russian', search_query)))::real,
      CASE 
        WHEN d.translation ILIKE '%' || search_query || '%' THEN 0.3::real
        ELSE 0.1::real
      END
    ) as rank
  FROM characters c
  LEFT JOIN definitions d ON c.id = d."characterId"
  WHERE 
    d.translation ILIKE '%' || search_query || '%'
    OR to_tsvector('russian', d.translation) @@ plainto_tsquery('russian', search_query)
    OR c.simplified LIKE '%' || search_query || '%'
    OR c.pinyin ILIKE '%' || search_query || '%'
  GROUP BY c.id, c.simplified, c.traditional, c.pinyin, d.translation
  ORDER BY rank DESC, c.simplified
  LIMIT result_limit;
END;
$$;

-- Добавляем комментарий к функции
COMMENT ON FUNCTION search_chinese_characters(text, integer) IS 
'Поиск иероглифов по китайскому тексту или русским переводам с использованием full-text search и ILIKE';
