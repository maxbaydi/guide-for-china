import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { DictionaryService } from '../services/dictionary.service';
import { Character } from '../entities/character.entity';
import { Phrase } from '../entities/phrase.entity';
import { CharacterAnalysis } from '../entities/character-analysis.entity';
import { SimilarWord } from '../entities/similar-word.entity';
import { ReverseTranslation } from '../entities/reverse-translation.entity';
import { Example } from '../entities/example.entity';

@Resolver()
export class DictionaryResolver {
  constructor(private dictionaryService: DictionaryService) {}

  @Query(() => [Character], {
    name: 'searchCharacters',
    description: 'Поиск иероглифов по упрощенному написанию, пиньиню или переводу',
  })
  async searchCharacters(
    @Args('query', { type: () => String }) query: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ): Promise<Character[]> {
    return this.dictionaryService.searchCharacters(query, limit);
  }

  @Query(() => Character, {
    name: 'getCharacter',
    description: 'Получить полную информацию об иероглифе по ID',
    nullable: true,
  })
  async getCharacter(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Character | null> {
    return this.dictionaryService.getCharacter(id);
  }

  @Query(() => Character, {
    name: 'getCharacterBySimplified',
    description: 'Получить информацию об иероглифе по упрощенному написанию',
    nullable: true,
  })
  async getCharacterBySimplified(
    @Args('simplified', { type: () => String }) simplified: string,
  ): Promise<Character | null> {
    return this.dictionaryService.getCharacterBySimplified(simplified);
  }

  @Query(() => [Phrase], {
    name: 'searchPhrases',
    description: 'Поиск фраз по русскому или китайскому тексту',
  })
  async searchPhrases(
    @Args('query', { type: () => String }) query: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ): Promise<Phrase[]> {
    return this.dictionaryService.searchPhrases(query, limit);
  }

  @Query(() => [CharacterAnalysis], {
    name: 'analyzeText',
    description: 'Разобрать текст на СЛОВА (пословный анализ) с использованием jieba и получить информацию о каждом слове',
  })
  async analyzeText(
    @Args('text', { type: () => String }) text: string,
  ): Promise<CharacterAnalysis[]> {
    // Валидация длины текста
    if (text.length > 300) {
      throw new Error('Text is too long. Maximum 300 characters allowed.');
    }
    
    return this.dictionaryService.analyzeText(text);
  }

  @Query(() => Character, {
    name: 'wordOfTheDay',
    description: 'Получить слово дня',
    nullable: true,
  })
  async wordOfTheDay(): Promise<Character | null> {
    return this.dictionaryService.getWordOfTheDay();
  }

  @Query(() => [SimilarWord], {
    name: 'getSimilarWords',
    description: 'Получить похожие слова (начинающиеся с иероглифа или содержащие его)',
  })
  async getSimilarWords(
    @Args('simplified', { type: () => String }) simplified: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ): Promise<SimilarWord[]> {
    return this.dictionaryService.getSimilarWords(simplified, limit);
  }

  @Query(() => [ReverseTranslation], {
    name: 'getReverseTranslations',
    description: 'Получить обратные переводы из таблицы фраз (где встречается иероглиф)',
  })
  async getReverseTranslations(
    @Args('simplified', { type: () => String }) simplified: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ): Promise<ReverseTranslation[]> {
    return this.dictionaryService.getReverseTranslations(simplified, limit);
  }

  @Query(() => [Example], {
    name: 'getCharacterExamples',
    description: 'Загрузить примеры для иероглифа (lazy loading)',
  })
  async getCharacterExamples(
    @Args('characterId', { type: () => String }) characterId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ): Promise<Example[]> {
    return this.dictionaryService.getCharacterExamples(characterId, limit);
  }
}

