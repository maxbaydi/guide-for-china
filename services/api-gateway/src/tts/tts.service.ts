import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(private httpService: HttpService) {}

  async synthesize(text: string) {
    this.logger.log(`Proxying synthesis request for text: "${text}"`);
    
    try {
      const { data } = await firstValueFrom(
        this.httpService.post('synthesize', { text }),
      );

      this.logger.log(`Synthesis response: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error('Synthesis proxy failed:', error.message);
      this.logger.error('Error details:', error.response?.data || error);
      throw error;
    }
  }

  async getAudioStream(hash: string) {
    this.logger.log(`Proxying audio request for hash: ${hash}`);
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`audio/${hash}`, {
          responseType: 'stream',
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Audio proxy failed:', error.message);
      throw error;
    }
  }
}







