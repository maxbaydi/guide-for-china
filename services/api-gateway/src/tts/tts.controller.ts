import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { TtsService } from './tts.service';
import { SynthesizeDto } from './dto/synthesize.dto';

@Controller('api/v1/tts')
export class TtsController {
  private readonly logger = new Logger(TtsController.name);

  constructor(private readonly ttsService: TtsService) {}

  @Post('synthesize')
  async synthesize(@Body() synthesizeDto: SynthesizeDto) {
    this.logger.log(`TTS synthesis request for text: "${synthesizeDto.text}"`);
    
    try {
      const result = await this.ttsService.synthesize(synthesizeDto.text);
      this.logger.log(`TTS synthesis completed: ${result.cached ? 'cached' : 'new'}`);
      return result;
    } catch (error) {
      this.logger.error('TTS synthesis failed:', error);
      throw new HttpException(
        error.message || 'TTS synthesis failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('audio/:hash')
  async getAudio(@Param('hash') hash: string, @Res() res: Response) {
    this.logger.log(`TTS audio request for hash: ${hash}`);
    
    try {
      // Validate hash format (should be MD5 hex string)
      if (!/^[a-f0-9]{32}$/.test(hash)) {
        throw new HttpException('Invalid hash format', HttpStatus.BAD_REQUEST);
      }

      const stream = await this.ttsService.getAudioStream(hash);
      
      res.set({
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${hash}.wav"`,
      });
      
      stream.pipe(res);
    } catch (error) {
      this.logger.error('TTS audio retrieval failed:', error);
      throw new HttpException(
        error.message || 'Failed to get audio file',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
