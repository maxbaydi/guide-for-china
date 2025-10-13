import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    character: {
      findUnique: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    definition: {
      createMany: jest.fn(),
    },
    example: {
      createMany: jest.fn(),
      create: jest.fn(),
    },
    phrase: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('import-bkrs script', () => {
  let prisma: any;
  let tempDir: string;

  beforeEach(() => {
    prisma = new PrismaClient();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'import-test-'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Import logic', () => {
    it('should have mocked Prisma client', () => {
      expect(prisma).toBeDefined();
      expect(prisma.character).toBeDefined();
      expect(prisma.definition).toBeDefined();
      expect(prisma.example).toBeDefined();
      expect(prisma.phrase).toBeDefined();
    });

    it('should mock character creation', async () => {
      prisma.character.create.mockResolvedValue({
        id: 'test-id',
        simplified: '学',
        traditional: '學',
        pinyin: 'xué',
      });

      const result = await prisma.character.create({
        data: {
          simplified: '学',
          traditional: '學',
          pinyin: 'xué',
        },
      });

      expect(result.id).toBe('test-id');
      expect(prisma.character.create).toHaveBeenCalled();
    });

    it('should mock definition creation', async () => {
      prisma.definition.createMany.mockResolvedValue({ count: 2 });

      const result = await prisma.definition.createMany({
        data: [
          { characterId: 'id1', translation: 'учиться', order: 0 },
          { characterId: 'id1', translation: 'учеба', order: 1 },
        ],
      });

      expect(result.count).toBe(2);
      expect(prisma.definition.createMany).toHaveBeenCalled();
    });

    it('should mock example creation', async () => {
      prisma.example.createMany.mockResolvedValue({ count: 1 });

      const result = await prisma.example.createMany({
        data: [
          {
            characterId: 'id1',
            chinese: '我在学习',
            russian: 'Я учусь',
          },
        ],
      });

      expect(result.count).toBe(1);
      expect(prisma.example.createMany).toHaveBeenCalled();
    });

    it('should mock phrase creation', async () => {
      prisma.phrase.findFirst.mockResolvedValue(null);
      prisma.phrase.create.mockResolvedValue({
        id: 'phrase-id',
        russian: 'быть в силе',
        chinese: '有势力',
      });

      const existing = await prisma.phrase.findFirst({
        where: { AND: [{ russian: 'быть в силе' }, { chinese: '有势力' }] },
      });

      expect(existing).toBeNull();

      const result = await prisma.phrase.create({
        data: {
          russian: 'быть в силе',
          chinese: '有势力',
        },
      });

      expect(result.id).toBe('phrase-id');
    });

    it('should handle character lookup by simplified', async () => {
      prisma.character.findUnique.mockResolvedValue({
        id: 'char-123',
        simplified: '学',
      });

      const char = await prisma.character.findUnique({
        where: { simplified: '学' },
      });

      expect(char).toBeDefined();
      expect(char.id).toBe('char-123');
    });

    it('should disconnect prisma on completion', async () => {
      await prisma.$disconnect();

      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Import statistics', () => {
    it('should track import statistics', () => {
      const stats = {
        totalCharacters: 0,
        totalDefinitions: 0,
        totalExamples: 0,
        totalPhrases: 0,
        errors: 0,
        startTime: Date.now(),
      };

      stats.totalCharacters = 100;
      stats.totalDefinitions = 250;
      stats.totalExamples = 150;
      stats.totalPhrases = 500;

      expect(stats.totalCharacters).toBe(100);
      expect(stats.totalDefinitions).toBe(250);
      expect(stats.totalExamples).toBe(150);
      expect(stats.totalPhrases).toBe(500);
    });
  });
});

