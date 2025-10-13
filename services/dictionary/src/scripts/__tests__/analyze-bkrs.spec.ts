import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { analyzeDslFile, AnalysisResult } from '../analyze-bkrs';

describe('analyze-bkrs script', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analyze-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function createTestFile(filename: string, content: string): string {
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  it('should analyze a simple DSL file', async () => {
    const content = `#NAME "Test Dictionary"
#INDEX_LANGUAGE "Russian"
#CONTENTS_LANGUAGE "Chinese"

学
 [m1]учиться[/m]

好
 [m1]хороший[/m]
 [m1]хорошо[/m]
`;

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.totalEntries).toBe(2);
    expect(result.totalDefinitions).toBe(3); // 1 + 2
    expect(result.dictionaryName).toBe('Test Dictionary');
    expect(result.indexLanguage).toBe('Russian');
    expect(result.contentsLanguage).toBe('Chinese');
  });

  it('should count entries with examples', async () => {
    const content = `学习
 [m1]учиться[/m]
 [m2][*][ex]我在学习。 - Я учусь.[/ex][/*][/m]

好
 [m1]хороший[/m]
`;

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.totalEntries).toBe(2);
    expect(result.entriesWithExamples).toBe(1);
    expect(result.totalExamples).toBe(1);
  });

  it('should count entries with pinyin', async () => {
    const content = `学 (xué)
 [m1]учиться[/m]

好
 [m1]хороший[/m]
`;

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.totalEntries).toBe(2);
    expect(result.entriesWithPinyin).toBe(1);
  });

  it('should count entries with traditional characters', async () => {
    const content = `学（學）
 [m1]учиться[/m]

好
 [m1]хороший[/m]
`;

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.totalEntries).toBe(2);
    expect(result.entriesWithTraditional).toBe(1);
  });

  it('should calculate averages correctly', async () => {
    const content = `学
 [m1]учиться[/m]
 [m1]учеба[/m]
 [m2][*][ex]例子1 - Пример 1[/ex][ex]例子2 - Пример 2[/ex][/*][/m]

好
 [m1]хороший[/m]
`;

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.averageDefinitionsPerEntry).toBeCloseTo(1.5, 1); // (2 + 1) / 2
    expect(result.averageExamplesPerEntry).toBeCloseTo(1.0, 1);    // (2 + 0) / 2
  });

  it('should collect sample entries', async () => {
    const content = `一
 [m1]один[/m]

二
 [m1]два[/m]

三
 [m1]три[/m]
`;

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.sampleEntries).toHaveLength(3);
    expect(result.sampleEntries).toContain('一');
    expect(result.sampleEntries).toContain('二');
    expect(result.sampleEntries).toContain('三');
  });

  it('should limit sample entries to 10', async () => {
    let content = '#NAME "Test"\n\n';
    
    for (let i = 0; i < 20; i++) {
      content += `Entry${i}\n [m1]translation${i}[/m]\n\n`;
    }

    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.totalEntries).toBe(20);
    expect(result.sampleEntries).toHaveLength(10);
  });

  it('should handle empty file', async () => {
    const content = `#NAME "Empty Dictionary"\n\n`;
    const filePath = createTestFile('test.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.totalEntries).toBe(0);
    expect(result.totalDefinitions).toBe(0);
    expect(result.totalExamples).toBe(0);
  });

  it('should return correct file name', async () => {
    const content = `学\n [m1]учиться[/m]\n`;
    const filePath = createTestFile('my-dictionary.dsl', content);
    const result = await analyzeDslFile(filePath);

    expect(result.fileName).toBe('my-dictionary.dsl');
  });
});

