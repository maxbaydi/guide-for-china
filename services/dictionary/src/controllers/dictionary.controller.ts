import { Controller, Get, Param, Query } from '@nestjs/common';
import { DictionaryService } from '../services/dictionary.service';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  /**
   * REST endpoint для получения иероглифа по ID
   */
  @Get('character/:id')
  async getCharacter(@Param('id') id: string) {
    return this.dictionaryService.getCharacter(id);
  }

  /**
   * REST endpoint для получения похожих слов
   */
  @Get('character/:id/similar')
  async getSimilarWords(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    // Сначала получаем иероглиф чтобы узнать его simplified
    const character = await this.dictionaryService.getCharacter(id);
    if (!character) {
      return [];
    }
    
    return this.dictionaryService.getSimilarWords(
      character.simplified,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  /**
   * REST endpoint для получения обратных переводов
   */
  @Get('character/:id/reverse')
  async getReverseTranslations(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    // Сначала получаем иероглиф чтобы узнать его simplified
    const character = await this.dictionaryService.getCharacter(id);
    if (!character) {
      return [];
    }
    
    return this.dictionaryService.getReverseTranslations(
      character.simplified,
      limit ? parseInt(limit.toString()) : 20,
    );
  }
}

