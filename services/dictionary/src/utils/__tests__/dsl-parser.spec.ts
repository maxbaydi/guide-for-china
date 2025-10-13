import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DslParser, createDslParser, DslEntry } from '../dsl-parser';

describe('DslParser', () => {
  let parser: DslParser;
  let tempDir: string;

  beforeEach(() => {
    parser = createDslParser();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsl-parser-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Helper function to create a test DSL file
   */
  function createTestFile(filename: string, content: string): string {
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  describe('parseEntry', () => {
    it('should parse simple entry with Chinese character', () => {
      const entry = parser.parseEntry('学', '[m1]учиться, изучать[/m]');

      expect(entry.headword).toBe('学');
      expect(entry.simplified).toBe('学');
      expect(entry.definitions).toHaveLength(1);
      expect(entry.definitions[0].translation).toBe('учиться, изучать');
    });

    it('should parse entry with traditional and simplified characters', () => {
      const entry = parser.parseEntry('学（學）', '[m1]учиться, изучать[/m]');

      expect(entry.simplified).toBe('学');
      expect(entry.traditional).toBe('學');
    });

    it('should extract pinyin from headword', () => {
      const entry = parser.parseEntry('学 (xué)', '[m1]учиться[/m]');

      expect(entry.pinyin).toBe('xué');
    });

    it('should parse multiple definitions', () => {
      const content = '[m1]1. учиться, изучать[/m][m1]2. учеба, обучение[/m][m1]3. наука[/m]';
      const entry = parser.parseEntry('学', content);

      expect(entry.definitions).toHaveLength(3);
      expect(entry.definitions[0].translation).toContain('учиться');
      expect(entry.definitions[1].translation).toContain('учеба');
      expect(entry.definitions[2].translation).toContain('наука');
    });

    it('should extract part of speech', () => {
      const content = '[m1]([i]глагол[/i]) учиться[/m]';
      const entry = parser.parseEntry('学', content);

      expect(entry.definitions[0].partOfSpeech).toBe('глагол');
    });

    it('should extract context markers', () => {
      const content = '[m1][c][i]перен.[/i][/c] изучать[/m]';
      const entry = parser.parseEntry('学', content);

      expect(entry.definitions[0].context).toBeDefined();
    });

    it('should extract examples', () => {
      const content = '[m1]учиться[/m][m2][*][ex]我在学中文。 - Я изучаю китайский.[/ex][/*][/m]';
      const entry = parser.parseEntry('学', content);

      expect(entry.examples).toHaveLength(1);
      expect(entry.examples[0].chinese).toBe('我在学中文。');
      expect(entry.examples[0].russian).toBe('Я изучаю китайский.');
    });

    it('should handle entries without examples', () => {
      const entry = parser.parseEntry('学', '[m1]учиться[/m]');

      expect(entry.examples).toHaveLength(0);
    });

    it('should handle complex nested tags', () => {
      const content = '[m1]1) ([i]обладать физическими и душевными силами[/i]) 有势力[/m][m1]2) ([i]иметь власть, влияние[/i]) 有权力[/m]';
      const entry = parser.parseEntry('быть в силе', content);

      expect(entry.definitions).toHaveLength(2);
      expect(entry.definitions[0].partOfSpeech).toBeDefined();
      expect(entry.definitions[1].partOfSpeech).toBeDefined();
    });

    it('should strip tags from translation text', () => {
      const content = '[m1][p]устар.[/p] 从来没有[/m]';
      const entry = parser.parseEntry('в заводе нет', content);

      expect(entry.definitions[0].translation).not.toContain('[p]');
      expect(entry.definitions[0].translation).not.toContain('[/p]');
    });
  });

  describe('parseMetadata', () => {
    it('should parse dictionary name', () => {
      parser.parseMetadata('#NAME "БРуКС (2025-10-13)"');
      const metadata = parser.getMetadata();

      expect(metadata.name).toBe('БРуКС (2025-10-13)');
    });

    it('should parse index language', () => {
      parser.parseMetadata('#INDEX_LANGUAGE "Russian"');
      const metadata = parser.getMetadata();

      expect(metadata.indexLanguage).toBe('Russian');
    });

    it('should parse contents language', () => {
      parser.parseMetadata('#CONTENTS_LANGUAGE "Chinese"');
      const metadata = parser.getMetadata();

      expect(metadata.contentsLanguage).toBe('Chinese');
    });
  });

  describe('parseFile', () => {
    it('should parse file with metadata', async () => {
      const content = `#NAME "Test Dictionary"
#INDEX_LANGUAGE "Russian"
#CONTENTS_LANGUAGE "Chinese"

学
 [m1]учиться[/m]

好
 [m1]хороший[/m]
`;

      const filePath = createTestFile('test.dsl', content);
      const entries: DslEntry[] = [];

      for await (const entry of parser.parseFile(filePath)) {
        entries.push(entry);
      }

      expect(entries).toHaveLength(2);
      expect(parser.getMetadata().name).toBe('Test Dictionary');
      expect(entries[0].simplified).toBe('学');
      expect(entries[1].simplified).toBe('好');
    });

    it('should handle empty lines between entries', async () => {
      const content = `学
 [m1]учиться[/m]


好
 [m1]хороший[/m]
`;

      const filePath = createTestFile('test.dsl', content);
      const entries: DslEntry[] = [];

      for await (const entry of parser.parseFile(filePath)) {
        entries.push(entry);
      }

      expect(entries).toHaveLength(2);
    });

    it('should handle multi-line content', async () => {
      const content = `学习
 [m1]учиться[/m]
 [m2][*][ex]我在学习。 - Я учусь.[/ex][/*][/m]

`;

      const filePath = createTestFile('test.dsl', content);
      const entries: DslEntry[] = [];

      for await (const entry of parser.parseFile(filePath)) {
        entries.push(entry);
      }

      expect(entries).toHaveLength(1);
      expect(entries[0].examples).toHaveLength(1);
    });

    it('should process entries as stream', async () => {
      const content = `一
 [m1]один[/m]

二
 [m1]два[/m]

三
 [m1]три[/m]
`;

      const filePath = createTestFile('test.dsl', content);
      let count = 0;

      for await (const entry of parser.parseFile(filePath)) {
        count++;
        expect(entry).toBeDefined();
        expect(entry.definitions).toHaveLength(1);
      }

      expect(count).toBe(3);
    });

    it('should handle real BKRS format example', async () => {
      const content = `#NAME "База примеров 大БКРС (2025-10-13)"
#INDEX_LANGUAGE "Chinese"
#CONTENTS_LANGUAGE "Russian"

柏威夏古庙
 древний храм Прэахвихеа

一万两千
 12 тысяч

一块一
 один юань и один мао
`;

      const filePath = createTestFile('test.dsl', content);
      const entries: DslEntry[] = [];

      for await (const entry of parser.parseFile(filePath)) {
        entries.push(entry);
      }

      expect(entries).toHaveLength(3);
      expect(parser.getMetadata().name).toBe('База примеров 大БКРС (2025-10-13)');
      expect(entries[0].simplified).toContain('柏威夏古庙');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const entry = parser.parseEntry('学', '');

      expect(entry.definitions).toHaveLength(0);
      expect(entry.examples).toHaveLength(0);
    });

    it('should handle Russian-only entries (no Chinese)', () => {
      const entry = parser.parseEntry('быть в силе', '[m1]有势力[/m]');

      expect(entry.headword).toBe('быть в силе');
      expect(entry.definitions).toHaveLength(1);
    });

    it('should handle entries with references', () => {
      const content = '[m1][p]см.[/p] [ref]всё равно один конец![/ref][/m]';
      const entry = parser.parseEntry('один конец', content);

      expect(entry.definitions).toHaveLength(1);
      expect(entry.definitions[0].translation).toBeTruthy();
    });

    it('should handle multiple examples in one entry', () => {
      const content = '[m1]учиться[/m][m2][*][ex]我学习。 - Я учусь.[/ex][ex]他学习。 - Он учится.[/ex][/*][/m]';
      const entry = parser.parseEntry('学习', content);

      expect(entry.examples).toHaveLength(2);
    });
  });

  describe('createDslParser', () => {
    it('should create a new parser instance', () => {
      const newParser = createDslParser();
      
      expect(newParser).toBeInstanceOf(DslParser);
      expect(newParser).not.toBe(parser);
    });
  });
});

