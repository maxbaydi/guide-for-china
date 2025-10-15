import * as fs from 'fs';
import * as readline from 'readline';

/**
 * DSL Dictionary Entry structure
 */
export interface DslEntry {
  headword: string;
  content: string;
  simplified?: string;
  traditional?: string;
  pinyin?: string;
  definitions: DslDefinition[];
  examples: DslExample[];
}

/**
 * Definition with translation
 */
export interface DslDefinition {
  translation: string;
  partOfSpeech?: string;
  context?: string;
  order: number;
}

/**
 * Example sentence
 */
export interface DslExample {
  chinese: string;
  pinyin?: string;
  russian: string;
}

/**
 * Dictionary metadata
 */
export interface DslMetadata {
  name?: string;
  indexLanguage?: string;
  contentsLanguage?: string;
}

/**
 * Parse DSL file format (BKRS dictionary format)
 */
export class DslParser {
  private metadata: DslMetadata = {};

  /**
   * Remove DSL tags from text
   */
  private stripTags(text: string): string {
    return text
      .replace(/\[m\d\]/g, '') // Remove [m1], [m2] tags
      .replace(/\[\/m\]/g, '')
      .replace(/\[\*\]/g, '')
      .replace(/\[\/\*\]/g, '')
      .replace(/\[ex\]/g, '')
      .replace(/\[\/ex\]/g, '')
      .replace(/\[i\]/g, '')
      .replace(/\[\/i\]/g, '')
      .replace(/\[c\]/g, '')
      .replace(/\[\/c\]/g, '')
      .replace(/\[p\]/g, '')
      .replace(/\[\/p\]/g, '')
      .replace(/\[ref\]/g, '')
      .replace(/\[\/ref\]/g, '')
      .replace(/\[b\]/g, '')
      .replace(/\[\/b\]/g, '')
      .replace(/\[u\]/g, '')
      .replace(/\[\/u\]/g, '')
      .trim();
  }

  /**
   * Extract text within specific tag
   */
  private extractTag(text: string, tag: string): string[] {
    const regex = new RegExp(`\\[${tag}\\](.*?)\\[\\/${tag}\\]`, 'gs');
    const matches = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  }

  /**
   * Extract all [m1], [m2] sections as definitions
   */
  private extractDefinitions(content: string): DslDefinition[] {
    const definitions: DslDefinition[] = [];
    const mRegex = /\[m(\d)\](.*?)(?=\[m\d\]|$)/gs;
    let match;
    let order = 0;

    while ((match = mRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      let text = match[2].trim();

      // Remove examples from definition text
      text = text.replace(/\[\*\].*?\[\/\*\]/gs, '');
      
      // Check for part of speech markers
      let partOfSpeech: string | undefined;
      const posMatch = text.match(/\[i\](.*?)\[\/i\]/);
      if (posMatch) {
        partOfSpeech = posMatch[1];
      }

      // Extract context markers
      let context: string | undefined;
      const contextMatch = text.match(/\[c\](.*?)\[\/c\]/);
      if (contextMatch) {
        context = contextMatch[1];
      }

      const cleanText = this.stripTags(text);
      
      if (cleanText) {
        definitions.push({
          translation: cleanText,
          partOfSpeech,
          context,
          order: order++,
        });
      }
    }

    return definitions;
  }

  /**
   * Extract examples from [*] [ex] tags
   */
  private extractExamples(content: string): DslExample[] {
    const examples: DslExample[] = [];
    const examplesBlocks = content.match(/\[\*\](.*?)\[\/\*\]/gs);

    if (!examplesBlocks) {
      return examples;
    }

    for (const block of examplesBlocks) {
      const exTexts = this.extractTag(block, 'ex');
      
      for (const exText of exTexts) {
        // Format: Chinese text - Russian translation
        const parts = exText.split(' - ');
        
        if (parts.length >= 2) {
          const chinese = parts[0].trim();
          const russian = parts.slice(1).join(' - ').trim();

          examples.push({
            chinese,
            russian,
          });
        }
      }
    }

    return examples;
  }

  /**
   * Check if text is a pure pinyin line (no DSL tags, only Latin with tones)
   */
  private isPinyinLine(text: string): boolean {
    // Remove leading/trailing whitespace
    const trimmed = text.trim();
    
    // Empty string is not pinyin
    if (!trimmed) return false;
    
    // Check if it contains only Latin letters, tones, spaces, and common pinyin characters
    // Includes: basic Latin, tone marks, ü, combining diacritics, numbers for tones
    const pinyinRegex = /^[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜêńňǹ\s0-9\u0300-\u036f]+$/;
    
    // Must not contain Chinese characters or DSL tags
    const hasChinese = /[\u4e00-\u9fff]/.test(trimmed);
    const hasDslTags = /\[.*?\]/.test(trimmed);
    
    return pinyinRegex.test(trimmed) && !hasChinese && !hasDslTags;
  }

  /**
   * Extract pinyin from text (supports multiple formats)
   */
  private extractPinyin(text: string): string | undefined {
    // First check if the entire text is a pure pinyin line
    if (this.isPinyinLine(text)) {
      return text.trim();
    }
    
    // Try to find pinyin in format like (xuéxí) or [pinyin]...[/pinyin]
    // Match Latin letters with tone marks in parentheses
    const pinyinMatch = text.match(/\(([a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüêńňǹ\s0-9\u0300-\u036f]+)\)/) || 
                        text.match(/\[pinyin\](.*?)\[\/pinyin\]/);
    
    if (pinyinMatch) {
      return pinyinMatch[1].trim();
    }
    
    return undefined;
  }

  /**
   * Check if character is Chinese
   */
  private isChinese(char: string): boolean {
    const code = char.charCodeAt(0);
    return (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
           (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
           (code >= 0x20000 && code <= 0x2a6df); // CJK Extension B
  }

  /**
   * Extract Chinese characters from headword
   */
  private extractChinese(headword: string): { simplified: string; traditional?: string } {
    // Check if there are both simplified and traditional (format: 学（學）)
    const traditionalMatch = headword.match(/(.+?)（(.+?)）/);
    
    if (traditionalMatch) {
      const simplified = traditionalMatch[1].trim().split('').filter(char => this.isChinese(char)).join('');
      const traditional = traditionalMatch[2].trim().split('').filter(char => this.isChinese(char)).join('');
      
      return {
        simplified,
        traditional: traditional || undefined,
      };
    }

    // Extract all Chinese characters if no traditional form
    const chinese = headword.split('').filter(char => this.isChinese(char)).join('');
    return { simplified: chinese };
  }

  /**
   * Parse a single dictionary entry
   */
  parseEntry(headword: string, content: string, pinyinLine?: string): DslEntry {
    const { simplified, traditional } = this.extractChinese(headword);
    
    // Priority: pinyinLine → headword → content
    let pinyin: string | undefined;
    if (pinyinLine) {
      pinyin = this.extractPinyin(pinyinLine);
    }
    if (!pinyin) {
      pinyin = this.extractPinyin(headword) || this.extractPinyin(content);
    }
    
    const definitions = this.extractDefinitions(content);
    const examples = this.extractExamples(content);

    return {
      headword: headword.trim(),
      content,
      simplified,
      traditional,
      pinyin,
      definitions,
      examples,
    };
  }

  /**
   * Parse metadata from DSL file header
   */
  parseMetadata(line: string): void {
    if (line.startsWith('#NAME')) {
      this.metadata.name = line.substring(6).trim().replace(/"/g, '');
    } else if (line.startsWith('#INDEX_LANGUAGE')) {
      this.metadata.indexLanguage = line.substring(17).trim().replace(/"/g, '');
    } else if (line.startsWith('#CONTENTS_LANGUAGE')) {
      this.metadata.contentsLanguage = line.substring(20).trim().replace(/"/g, '');
    }
  }

  /**
   * Parse DSL file and return entries
   */
  async *parseFile(filePath: string): AsyncGenerator<DslEntry> {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let currentHeadword: string | null = null;
    let currentPinyinLine: string | null = null;
    let currentContent: string[] = [];
    let inHeader = true;
    let isFirstContentLine = true;

    for await (const line of rl) {
      // Parse metadata in header
      if (inHeader && line.startsWith('#')) {
        this.parseMetadata(line);
        continue;
      }

      if (inHeader && line.trim() === '') {
        inHeader = false;
        continue;
      }

      // Empty line indicates end of entry
      if (line.trim() === '' && currentHeadword) {
        const entry = this.parseEntry(currentHeadword, currentContent.join('\n'), currentPinyinLine || undefined);
        yield entry;
        
        currentHeadword = null;
        currentPinyinLine = null;
        currentContent = [];
        isFirstContentLine = true;
        continue;
      }

      // Line starting without space is headword
      if (!line.startsWith(' ') && !line.startsWith('\t') && line.trim() !== '') {
        // If we have a previous entry, yield it
        if (currentHeadword) {
          const entry = this.parseEntry(currentHeadword, currentContent.join('\n'), currentPinyinLine || undefined);
          yield entry;
          currentContent = [];
        }
        
        currentHeadword = line.trim();
        currentPinyinLine = null;
        isFirstContentLine = true;
      } else if (currentHeadword && line.trim() !== '') {
        // Check if this is the first content line and it looks like pinyin
        if (isFirstContentLine && this.isPinyinLine(line)) {
          currentPinyinLine = line.trim();
          isFirstContentLine = false;
        } else {
          // Regular content line
          currentContent.push(line.trim());
          isFirstContentLine = false;
        }
      }
    }

    // Don't forget the last entry
    if (currentHeadword) {
      const entry = this.parseEntry(currentHeadword, currentContent.join('\n'), currentPinyinLine || undefined);
      yield entry;
    }
  }

  /**
   * Get dictionary metadata
   */
  getMetadata(): DslMetadata {
    return this.metadata;
  }
}

/**
 * Create a new DSL parser instance
 */
export function createDslParser(): DslParser {
  return new DslParser();
}

