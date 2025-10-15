import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(private httpService: HttpService) {}

  async searchCharacters(query: string, limit: number = 20) {
    const graphqlQuery = `
      query SearchCharacters($query: String!, $limit: Int) {
        searchCharacters(query: $query, limit: $limit) {
          id
          simplified
          traditional
          pinyin
          frequency
          definitions {
            translation
            partOfSpeech
          }
        }
      }
    `;

    const requestBody = {
      query: graphqlQuery,
      variables: { query, limit },
    };

    this.logger.log(`Sending GraphQL request to Dictionary Service:`);
    this.logger.log(JSON.stringify(requestBody, null, 2));

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', requestBody),
      );

      this.logger.log(`GraphQL response: ${JSON.stringify(data)}`);

      if (data.errors) {
        this.logger.error('Search error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.searchCharacters;
    } catch (error) {
      this.logger.error('Search failed:', error.message);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  async getCharacter(id: string) {
    const graphqlQuery = `
      query GetCharacter($id: String!) {
        getCharacter(id: $id) {
          id
          simplified
          traditional
          pinyin
          frequency
          definitions {
            translation
            partOfSpeech
            context
            order
          }
          examples {
            chinese
            pinyin
            russian
          }
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', {
          query: graphqlQuery,
          variables: { id },
        }),
      );

      if (data.errors) {
        this.logger.error('Get character error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.getCharacter;
    } catch (error) {
      this.logger.error('Get character failed:', error.message);
      throw error;
    }
  }

  async analyzeText(text: string) {
    const graphqlQuery = `
      query AnalyzeText($text: String!) {
        analyzeText(text: $text) {
          position
          character
          details {
            id
            simplified
            traditional
            pinyin
            definitions {
              translation
              partOfSpeech
            }
          }
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', {
          query: graphqlQuery,
          variables: { text },
        }),
      );

      if (data.errors) {
        this.logger.error('Analyze text error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.analyzeText;
    } catch (error) {
      this.logger.error('Text analysis failed:', error.message);
      throw error;
    }
  }

  async searchPhrases(query: string, limit: number = 20) {
    const graphqlQuery = `
      query SearchPhrases($query: String!, $limit: Int) {
        searchPhrases(query: $query, limit: $limit) {
          id
          russian
          chinese
          pinyin
          context
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', {
          query: graphqlQuery,
          variables: { query, limit },
        }),
      );

      if (data.errors) {
        this.logger.error('Search phrases error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.searchPhrases;
    } catch (error) {
      this.logger.error('Phrase search failed:', error.message);
      throw error;
    }
  }

  async getWordOfTheDay() {
    const graphqlQuery = `
      query {
        wordOfTheDay {
          id
          simplified
          traditional
          pinyin
          hskLevel
          frequency
          definitions {
            id
            translation
            partOfSpeech
            order
          }
          examples {
            id
            chinese
            pinyin
            russian
          }
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', {
          query: graphqlQuery,
        }),
      );

      if (data.errors) {
        this.logger.error('Get word of the day error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.wordOfTheDay;
    } catch (error) {
      this.logger.error('Get word of the day failed:', error.message);
      throw error;
    }
  }

  async getSimilarWords(simplified: string, limit: number = 20) {
    const graphqlQuery = `
      query GetSimilarWords($simplified: String!, $limit: Int) {
        getSimilarWords(simplified: $simplified, limit: $limit) {
          id
          simplified
          pinyin
          mainTranslation
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', {
          query: graphqlQuery,
          variables: { simplified, limit },
        }),
      );

      if (data.errors) {
        this.logger.error('Get similar words error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.getSimilarWords;
    } catch (error) {
      this.logger.error('Get similar words failed:', error.message);
      throw error;
    }
  }

  async getReverseTranslations(simplified: string, limit: number = 20) {
    const graphqlQuery = `
      query GetReverseTranslations($simplified: String!, $limit: Int) {
        getReverseTranslations(simplified: $simplified, limit: $limit) {
          russian
          chinese
          pinyin
        }
      }
    `;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('graphql', {
          query: graphqlQuery,
          variables: { simplified, limit },
        }),
      );

      if (data.errors) {
        this.logger.error('Get reverse translations error:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data.getReverseTranslations;
    } catch (error) {
      this.logger.error('Get reverse translations failed:', error.message);
      throw error;
    }
  }
}

