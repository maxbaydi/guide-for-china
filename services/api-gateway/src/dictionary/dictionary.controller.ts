import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { UserService } from '../user/user.service';

@Controller('api/v1/dictionary')
@UseGuards(RateLimitGuard)
export class DictionaryController {
  private readonly logger = new Logger(DictionaryController.name);
  
  constructor(
    private dictionaryService: DictionaryService,
    private userService: UserService,
  ) {}

  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    this.logger.log(`Search request: query="${query}", limit="${limit}"`);
    
    if (!query) {
      throw new HttpException(
        'Query parameter "query" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      this.logger.log(`Searching for "${query}" with limit ${limitNum}`);
      const result = await this.dictionaryService.searchCharacters(query, limitNum);
      this.logger.log(`Search returned ${result?.length || 0} results`);
      
      // Track statistics if user is authenticated
      if (req?.user?.sub) {
        await this.userService.incrementSearchCount(req.user.sub);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('character/:id/similar')
  async getSimilarWords(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    try {
      // Сначала получаем иероглиф чтобы узнать его simplified
      const character = await this.dictionaryService.getCharacter(id);
      if (!character) {
        throw new HttpException(
          'Character not found',
          HttpStatus.NOT_FOUND,
        );
      }
      
      const limitNum = limit ? parseInt(limit, 10) : 20;
      return await this.dictionaryService.getSimilarWords(
        character.simplified,
        limitNum,
      );
    } catch (error) {
      this.logger.error(`Failed to get similar words for ${id}: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get similar words',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('character/:id/reverse')
  async getReverseTranslations(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    try {
      // Сначала получаем иероглиф чтобы узнать его simplified
      const character = await this.dictionaryService.getCharacter(id);
      if (!character) {
        throw new HttpException(
          'Character not found',
          HttpStatus.NOT_FOUND,
        );
      }
      
      const limitNum = limit ? parseInt(limit, 10) : 20;
      return await this.dictionaryService.getReverseTranslations(
        character.simplified,
        limitNum,
      );
    } catch (error) {
      this.logger.error(`Failed to get reverse translations for ${id}: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get reverse translations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('character/:id')
  async getCharacter(@Param('id') id: string) {
    try {
      const character = await this.dictionaryService.getCharacter(id);
      
      if (!character) {
        this.logger.warn(`Character not found: ${id}`);
        throw new HttpException(
          'Character not found',
          HttpStatus.NOT_FOUND,
        );
      }
      
      return character;
    } catch (error) {
      this.logger.error(`Failed to get character ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Character not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('analyze')
  async analyzeText(
    @Query('text') text: string,
    @Req() req?: any,
  ) {
    if (!text) {
      throw new HttpException(
        'Query parameter "text" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Валидация длины текста
    if (text.length > 300) {
      throw new HttpException(
        'Text is too long. Maximum 300 characters allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.dictionaryService.analyzeText(text);
      
      // Track statistics if user is authenticated
      if (req?.user?.sub) {
        await this.userService.incrementAnalysisCount(req.user.sub);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Text analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('phrases/search')
  async searchPhrases(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      throw new HttpException(
        'Query parameter "q" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      return await this.dictionaryService.searchPhrases(query, limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Phrase search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('word-of-the-day')
  async getWordOfTheDay() {
    try {
      return await this.dictionaryService.getWordOfTheDay();
    } catch (error) {
      this.logger.error(`Word of the day failed: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to get word of the day',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

