import {
  detectInputType,
  InputType,
  containsChinese,
  isPinyin,
  isRussian,
} from '../input-detector';

describe('InputDetector', () => {
  describe('detectInputType', () => {
    describe('Chinese input', () => {
      it('should detect single Chinese character', () => {
        expect(detectInputType('你')).toBe(InputType.CHINESE);
        expect(detectInputType('好')).toBe(InputType.CHINESE);
        expect(detectInputType('中')).toBe(InputType.CHINESE);
      });

      it('should detect multiple Chinese characters', () => {
        expect(detectInputType('你好')).toBe(InputType.CHINESE);
        expect(detectInputType('中国')).toBe(InputType.CHINESE);
        expect(detectInputType('学习汉语')).toBe(InputType.CHINESE);
      });

      it('should detect Chinese with punctuation', () => {
        expect(detectInputType('你好！')).toBe(InputType.CHINESE);
        expect(detectInputType('你好吗？')).toBe(InputType.CHINESE);
      });
    });

    describe('Pinyin input', () => {
      it('should detect simple pinyin', () => {
        expect(detectInputType('nihao')).toBe(InputType.PINYIN);
        expect(detectInputType('zhongguo')).toBe(InputType.PINYIN);
        expect(detectInputType('xuexi')).toBe(InputType.PINYIN);
      });

      it('should detect pinyin with tones', () => {
        expect(detectInputType('nǐhǎo')).toBe(InputType.PINYIN);
        expect(detectInputType('zhōngguó')).toBe(InputType.PINYIN);
      });

      it('should detect pinyin with numbers as tones', () => {
        expect(detectInputType('ni3hao3')).toBe(InputType.PINYIN);
        expect(detectInputType('zhong1guo2')).toBe(InputType.PINYIN);
      });

      it('should detect pinyin with ü', () => {
        expect(detectInputType('lü')).toBe(InputType.PINYIN);
        expect(detectInputType('nü')).toBe(InputType.PINYIN);
      });

      it('should detect pinyin with spaces', () => {
        expect(detectInputType('ni hao')).toBe(InputType.PINYIN);
        expect(detectInputType('zhong guo')).toBe(InputType.PINYIN);
      });
    });

    describe('Russian input', () => {
      it('should detect single Russian word', () => {
        expect(detectInputType('привет')).toBe(InputType.RUSSIAN);
        expect(detectInputType('здравствуй')).toBe(InputType.RUSSIAN);
        expect(detectInputType('спасибо')).toBe(InputType.RUSSIAN);
      });

      it('should detect multiple Russian words', () => {
        expect(detectInputType('как дела')).toBe(InputType.RUSSIAN);
        expect(detectInputType('учить китайский')).toBe(InputType.RUSSIAN);
      });

      it('should detect Russian with punctuation', () => {
        expect(detectInputType('привет!')).toBe(InputType.RUSSIAN);
        expect(detectInputType('как дела?')).toBe(InputType.RUSSIAN);
      });

      it('should detect Russian with ё', () => {
        expect(detectInputType('ёжик')).toBe(InputType.RUSSIAN);
        expect(detectInputType('всё')).toBe(InputType.RUSSIAN);
      });
    });

    describe('Mixed input', () => {
      it('should detect mixed Chinese and pinyin', () => {
        expect(detectInputType('你hao')).toBe(InputType.MIXED);
        expect(detectInputType('ni好')).toBe(InputType.MIXED);
      });

      it('should detect mixed Chinese and Russian', () => {
        expect(detectInputType('你привет')).toBe(InputType.MIXED);
      });

      it('should detect empty or whitespace-only input', () => {
        expect(detectInputType('')).toBe(InputType.MIXED);
        expect(detectInputType('   ')).toBe(InputType.MIXED);
        expect(detectInputType('\t\n')).toBe(InputType.MIXED);
      });

      it('should detect input with only punctuation/numbers', () => {
        expect(detectInputType('123')).toBe(InputType.MIXED);
        expect(detectInputType('!!!')).toBe(InputType.MIXED);
        expect(detectInputType('123abc')).toBe(InputType.PINYIN);
      });
    });
  });

  describe('containsChinese', () => {
    it('should return true for text with Chinese characters', () => {
      expect(containsChinese('你好')).toBe(true);
      expect(containsChinese('hello你好')).toBe(true);
      expect(containsChinese('test测试')).toBe(true);
    });

    it('should return false for text without Chinese characters', () => {
      expect(containsChinese('hello')).toBe(false);
      expect(containsChinese('привет')).toBe(false);
      expect(containsChinese('123')).toBe(false);
      expect(containsChinese('')).toBe(false);
    });
  });

  describe('isPinyin', () => {
    it('should return true for valid pinyin', () => {
      expect(isPinyin('nihao')).toBe(true);
      expect(isPinyin('nǐhǎo')).toBe(true);
      expect(isPinyin('ni3hao3')).toBe(true);
      expect(isPinyin('ni hao')).toBe(true);
      expect(isPinyin('lü')).toBe(true);
    });

    it('should return false for non-pinyin text', () => {
      expect(isPinyin('你好')).toBe(false);
      expect(isPinyin('привет')).toBe(false);
      expect(isPinyin('hello世界')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isPinyin('')).toBe(true); // Empty string technically matches
      expect(isPinyin('   ')).toBe(true); // Whitespace only
    });
  });

  describe('isRussian', () => {
    it('should return true for Russian text', () => {
      expect(isRussian('привет')).toBe(true);
      expect(isRussian('здравствуй')).toBe(true);
      expect(isRussian('как дела')).toBe(true);
      expect(isRussian('ёжик')).toBe(true);
    });

    it('should return false for non-Russian text', () => {
      expect(isRussian('hello')).toBe(false);
      expect(isRussian('你好')).toBe(false);
      expect(isRussian('nihao')).toBe(false);
    });

    it('should handle mixed text correctly', () => {
      expect(isRussian('привет hello')).toBe(true); // > 50% Cyrillic
      expect(isRussian('hello привет')).toBe(true); // > 50% Cyrillic
    });

    it('should handle edge cases', () => {
      expect(isRussian('')).toBe(false);
      expect(isRussian('   ')).toBe(false);
      expect(isRussian('123')).toBe(false);
    });
  });
});

