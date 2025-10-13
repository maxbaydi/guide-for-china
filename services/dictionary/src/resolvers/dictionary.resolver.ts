import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { DictionaryService } from '../services/dictionary.service';
import { Character } from '../entities/character.entity';
import { Phrase } from '../entities/phrase.entity';
import { CharacterAnalysis } from '../entities/character-analysis.entity';

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
    description: 'Разобрать текст на иероглифы и получить информацию о каждом',
  })
  async analyzeText(
    @Args('text', { type: () => String }) text: string,
  ): Promise<CharacterAnalysis[]> {
    return this.dictionaryService.analyzeText(text);
  }
}

