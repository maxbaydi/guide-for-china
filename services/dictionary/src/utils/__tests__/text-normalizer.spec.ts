import {
  normalizePinyin,
  normalizeRussian,
  normalizeChinese,
  chineseToPinyin,
  normalizeQuery,
  sanitizeQuery,
} from '../text-normalizer';

describe('TextNormalizer', () => {
  describe('normalizePinyin', () => {
    it('should remove tone marks', () => {
      expect(normalizePinyin('nǐhǎo')).toBe('nihao');
      expect(normalizePinyin('zhōngguó')).toBe('zhongguo');
      expect(normalizePinyin('xuéxí')).toBe('xuexi');
    });

    it('should remove numeric tones', () => {
      expect(normalizePinyin('ni3hao3')).toBe('nihao');
      expect(normalizePinyin('zhong1guo2')).toBe('zhongguo');
      expect(normalizePinyin('xue2xi2')).toBe('xuexi');
    });

    it('should convert to lowercase', () => {
      expect(normalizePinyin('NiHao')).toBe('nihao');
      expect(normalizePinyin('ZHONGGUO')).toBe('zhongguo');
      expect(normalizePinyin('XueXi')).toBe('xuexi');
    });

    it('should replace ü with v', () => {
      expect(normalizePinyin('lü')).toBe('lv');
      expect(normalizePinyin('nü')).toBe('nv');
      expect(normalizePinyin('lǚ')).toBe('lv');
    });

    it('should normalize spaces', () => {
      expect(normalizePinyin('ni  hao')).toBe('ni hao');
      expect(normalizePinyin('  nihao  ')).toBe('nihao');
      expect(normalizePinyin('ni   hao   ma')).toBe('ni hao ma');
    });

    it('should handle combined transformations', () => {
      expect(normalizePinyin('Nǐ3Hǎo5')).toBe('nihao');
      expect(normalizePinyin('  Lǚ4xíng2  ')).toBe('lvxing');
    });

    it('should handle empty or whitespace strings', () => {
      expect(normalizePinyin('')).toBe('');
      expect(normalizePinyin('   ')).toBe('');
      expect(normalizePinyin('\t\n')).toBe('');
    });
  });

  describe('normalizeRussian', () => {
    it('should convert to lowercase', () => {
      expect(normalizeRussian('ПРИВЕТ')).toBe('привет');
      expect(normalizeRussian('Здравствуй')).toBe('здравствуй');
      expect(normalizeRussian('СПАСИБО')).toBe('спасибо');
    });

    it('should normalize spaces', () => {
      expect(normalizeRussian('как  дела')).toBe('как дела');
      expect(normalizeRussian('  привет  ')).toBe('привет');
      expect(normalizeRussian('очень   хорошо')).toBe('очень хорошо');
    });

    it('should handle ё correctly', () => {
      expect(normalizeRussian('Ёжик')).toBe('ёжик');
      expect(normalizeRussian('ВСЁ')).toBe('всё');
    });

    it('should handle empty or whitespace strings', () => {
      expect(normalizeRussian('')).toBe('');
      expect(normalizeRussian('   ')).toBe('');
      expect(normalizeRussian('\t\n')).toBe('');
    });
  });

  describe('normalizeChinese', () => {
    it('should remove spaces between characters', () => {
      expect(normalizeChinese('你 好')).toBe('你好');
      expect(normalizeChinese('中 国')).toBe('中国');
      expect(normalizeChinese('学 习 汉 语')).toBe('学习汉语');
    });

    it('should trim whitespace', () => {
      expect(normalizeChinese('  你好  ')).toBe('你好');
      expect(normalizeChinese('\t中国\n')).toBe('中国');
    });

    it('should handle already normalized text', () => {
      expect(normalizeChinese('你好')).toBe('你好');
      expect(normalizeChinese('中国')).toBe('中国');
    });

    it('should handle empty or whitespace strings', () => {
      expect(normalizeChinese('')).toBe('');
      expect(normalizeChinese('   ')).toBe('');
      expect(normalizeChinese('\t\n')).toBe('');
    });
  });

  describe('chineseToPinyin', () => {
    it('should convert Chinese characters to pinyin', () => {
      const result = chineseToPinyin('你好');
      // Результат должен быть пиньином без тонов
      expect(result).toMatch(/^[a-z\s]+$/);
      expect(result).not.toContain('你');
      expect(result).not.toContain('好');
    });

    it('should handle single character', () => {
      const result = chineseToPinyin('你');
      expect(result).toMatch(/^[a-z]+$/);
    });

    it('should normalize the output', () => {
      const result = chineseToPinyin('你好');
      // Результат должен быть lowercase без тонов
      expect(result).toBe(result.toLowerCase());
      expect(result).not.toMatch(/[0-9]/);
    });

    it('should handle non-Chinese text gracefully', () => {
      // Для не-китайского текста должен вернуть оригинал или обработать без ошибки
      expect(() => chineseToPinyin('hello')).not.toThrow();
      expect(() => chineseToPinyin('привет')).not.toThrow();
    });

    it('should handle empty string', () => {
      expect(() => chineseToPinyin('')).not.toThrow();
    });
  });

  describe('normalizeQuery', () => {
    it('should auto-detect and normalize Chinese', () => {
      const result = normalizeQuery('你 好');
      expect(result).toBe('你好');
    });

    it('should auto-detect and normalize Russian', () => {
      const result = normalizeQuery('ПРИВЕТ');
      expect(result).toBe('привет');
    });

    it('should auto-detect and normalize pinyin', () => {
      const result = normalizeQuery('Nǐ3Hǎo5');
      expect(result).toBe('nihao');
    });

    it('should use provided type for normalization', () => {
      expect(normalizeQuery('你 好', 'chinese')).toBe('你好');
      expect(normalizeQuery('ПРИВЕТ', 'russian')).toBe('привет');
      expect(normalizeQuery('Nǐ3Hǎo5', 'pinyin')).toBe('nihao');
    });

    it('should handle empty strings', () => {
      expect(normalizeQuery('')).toBe('');
      expect(normalizeQuery('', 'chinese')).toBe('');
      expect(normalizeQuery('', 'russian')).toBe('');
      expect(normalizeQuery('', 'pinyin')).toBe('');
    });

    it('should handle mixed content', () => {
      // Для смешанного контента будет автоматически определен тип
      const result = normalizeQuery('hello123');
      expect(result).toBeTruthy();
    });
  });

  describe('sanitizeQuery', () => {
    it('should remove special characters', () => {
      expect(sanitizeQuery('hello!')).toBe('hello');
      expect(sanitizeQuery('test@#$%')).toBe('test');
      expect(sanitizeQuery('привет!!!')).toBe('привет');
    });

    it('should keep letters, numbers and spaces', () => {
      expect(sanitizeQuery('test 123')).toBe('test 123');
      expect(sanitizeQuery('你好123')).toBe('你好123');
      expect(sanitizeQuery('привет 456')).toBe('привет 456');
    });

    it('should normalize multiple spaces', () => {
      expect(sanitizeQuery('hello   world')).toBe('hello world');
      expect(sanitizeQuery('  test  123  ')).toBe('test 123');
    });

    it('should handle Unicode letters', () => {
      expect(sanitizeQuery('你好')).toBe('你好');
      expect(sanitizeQuery('привет')).toBe('привет');
      expect(sanitizeQuery('nǐhǎo')).toBe('nǐhǎo');
    });

    it('should handle empty or whitespace strings', () => {
      expect(sanitizeQuery('')).toBe('');
      expect(sanitizeQuery('   ')).toBe('');
      expect(sanitizeQuery('!!!')).toBe('');
    });
  });
});

