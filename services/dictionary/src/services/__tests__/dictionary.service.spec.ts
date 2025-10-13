import { Test, TestingModule } from '@nestjs/testing';
import { DictionaryService } from '../dictionary.service';
import { PrismaService } from '../prisma.service';

describe('DictionaryService', () => {
  let service: DictionaryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DictionaryService, PrismaService],
    }).compile();

    service = module.get<DictionaryService>(DictionaryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('searchCharacters', () => {
    it('должен найти иероглифы по запросу', async () => {
      // Мокаем $queryRaw для unit теста
      const mockCharacter = {
        id: '123',
        simplified: '学',
        traditional: '學',
        pinyin: 'xué',
        hskLevel: null,
        frequency: null,
        createdAt: new Date(),
      };
      
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([mockCharacter]);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        ...mockCharacter,
        definitions: [],
        examples: [],
      } as any);
      
      const results = await service.searchCharacters('学', 5);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('simplified');
    });

    it('должен ограничивать количество результатов', async () => {
      const mockResults = [
        { id: '1', simplified: '中' },
        { id: '2', simplified: '中国' },
        { id: '3', simplified: '中文' },
      ];
      
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue(mockResults);
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue({
        id: '1',
        simplified: '中',
        traditional: null,
        pinyin: 'zhōng',
        hskLevel: null,
        frequency: null,
        createdAt: new Date(),
        definitions: [],
        examples: [],
      } as any);
      
      const limit = 3;
      const results = await service.searchCharacters('中', limit);
      
      expect(results.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('getCharacter', () => {
    it('должен вернуть иероглиф по ID', async () => {
      const mockId = '123e4567-e89b-12d3-a456-426614174000';
      const mockCharacter = {
        id: mockId,
        simplified: '中',
        traditional: null,
        pinyin: 'zhōng',
        hskLevel: null,
        frequency: null,
        createdAt: new Date(),
        definitions: [],
        examples: [],
      };
      
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(mockCharacter as any);
      
      const character = await service.getCharacter(mockId);
      
      expect(character).toBeDefined();
      expect(character?.id).toBe(mockId);
      expect(character?.definitions).toBeDefined();
    });

    it('должен вернуть null для несуществующего ID', async () => {
      jest.spyOn(prisma.character, 'findUnique').mockResolvedValue(null);
      
      const character = await service.getCharacter('00000000-0000-0000-0000-000000000000');
      expect(character).toBeNull();
    });
  });

  describe('getCharacterBySimplified', () => {
    it('должен найти иероглиф по упрощенному написанию', async () => {
      const mockCharacter = {
        id: '123',
        simplified: '学',
        traditional: '學',
        pinyin: 'xué',
        hskLevel: null,
        frequency: null,
        createdAt: new Date(),
        definitions: [{ id: '1', translation: 'учиться', order: 0 }],
        examples: [],
      };
      
      jest.spyOn(prisma.character, 'findFirst').mockResolvedValue(mockCharacter as any);
      
      const character = await service.getCharacterBySimplified('学');
      
      expect(character).toBeDefined();
      expect(character?.simplified).toBe('学');
      expect(character?.definitions.length).toBeGreaterThan(0);
    });

    it('должен вернуть null для несуществующего иероглифа', async () => {
      jest.spyOn(prisma.character, 'findFirst').mockResolvedValue(null);
      
      const character = await service.getCharacterBySimplified('這不存在');
      expect(character).toBeNull();
    });
  });

  describe('searchPhrases', () => {
    it('должен найти фразы по русскому запросу', async () => {
      const mockPhrases = [
        {
          id: '1',
          russian: 'учиться',
          chinese: '学习',
          pinyin: 'xuéxí',
          context: null,
          createdAt: new Date(),
        },
      ];
      
      jest.spyOn(prisma.phrase, 'findMany').mockResolvedValue(mockPhrases as any);
      
      const results = await service.searchPhrases('учиться', 10);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('russian');
      expect(results[0]).toHaveProperty('chinese');
    });

    it('должен найти фразы по китайскому запросу', async () => {
      const mockPhrases = [
        {
          id: '2',
          russian: 'изучать',
          chinese: '学习',
          pinyin: 'xuéxí',
          context: null,
          createdAt: new Date(),
        },
      ];
      
      jest.spyOn(prisma.phrase, 'findMany').mockResolvedValue(mockPhrases as any);
      
      const results = await service.searchPhrases('学习', 10);
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('analyzeText', () => {
    it('должен разобрать текст на иероглифы', async () => {
      // Мокаем getCharacterBySimplified для каждого иероглифа
      (jest.spyOn(prisma.character, 'findFirst') as any).mockImplementation((args: any) => {
        const mockCharacters: any = {
          '我': { id: '1', simplified: '我', pinyin: 'wǒ', definitions: [], examples: [] },
          '学': { id: '2', simplified: '学', pinyin: 'xué', definitions: [], examples: [] },
          '习': { id: '3', simplified: '习', pinyin: 'xí', definitions: [], examples: [] },
          '中': { id: '4', simplified: '中', pinyin: 'zhōng', definitions: [], examples: [] },
          '文': { id: '5', simplified: '文', pinyin: 'wén', definitions: [], examples: [] },
        };
        return Promise.resolve(mockCharacters[args.where.simplified] || null);
      });
      
      const text = '我学习中文';
      const analysis = await service.analyzeText(text);
      
      expect(Array.isArray(analysis)).toBe(true);
      expect(analysis.length).toBeGreaterThan(0);
      
      analysis.forEach((item) => {
        expect(item).toHaveProperty('character');
        expect(item).toHaveProperty('position');
        expect(typeof item.position).toBe('number');
      });
    });

    it('должен игнорировать не-китайские символы', async () => {
      (jest.spyOn(prisma.character, 'findFirst') as any).mockImplementation((args: any) => {
        const mockCharacters: any = {
          '你': { id: '1', simplified: '你', pinyin: 'nǐ', definitions: [], examples: [] },
          '好': { id: '2', simplified: '好', pinyin: 'hǎo', definitions: [], examples: [] },
        };
        return Promise.resolve(mockCharacters[args.where.simplified] || null);
      });
      
      const text = 'Hello 你好 World';
      const analysis = await service.analyzeText(text);
      
      // Должны быть найдены только китайские иероглифы
      expect(analysis.every(item => /[\u4e00-\u9fff]/.test(item.character))).toBe(true);
    });

    it('должен вернуть пустой массив для текста без иероглифов', async () => {
      const text = 'Hello World 123';
      const analysis = await service.analyzeText(text);
      
      expect(analysis).toEqual([]);
    });
  });

  describe('getStatistics', () => {
    it('должен вернуть статистику словаря', async () => {
      // Мокаем count для каждой таблицы
      jest.spyOn(prisma.character, 'count').mockResolvedValue(3420720);
      jest.spyOn(prisma.definition, 'count').mockResolvedValue(3600009);
      jest.spyOn(prisma.example, 'count').mockResolvedValue(653);
      jest.spyOn(prisma.phrase, 'count').mockResolvedValue(245702);
      
      const stats = await service.getStatistics();
      
      expect(stats).toHaveProperty('characters');
      expect(stats).toHaveProperty('definitions');
      expect(stats).toHaveProperty('examples');
      expect(stats).toHaveProperty('phrases');
      
      expect(typeof stats.characters).toBe('number');
      expect(typeof stats.definitions).toBe('number');
      expect(typeof stats.examples).toBe('number');
      expect(typeof stats.phrases).toBe('number');
      
      // После импорта должны быть данные
      expect(stats.characters).toBeGreaterThan(0);
      expect(stats.characters).toBe(3420720);
    });
  });
});

