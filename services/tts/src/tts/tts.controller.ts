import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  Res, 
  UseGuards, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { TtsService } from './tts.service';
import { SynthesizeDto } from './dto/synthesize.dto';

@Controller()
@UseGuards(ThrottlerGuard)
export class TtsController {
  private readonly logger = new Logger(TtsController.name);

  constructor(private readonly ttsService: TtsService) {}

  @Post('synthesize')
  async synthesize(@Body() synthesizeDto: SynthesizeDto) {
    this.logger.log(`Synthesis request for text: "${synthesizeDto.text}"`);
    
    try {
      const result = await this.ttsService.synthesize(synthesizeDto.text);
      this.logger.log(`Synthesis completed: ${result.cached ? 'cached' : 'new'}`);
      return result;
    } catch (error) {
      this.logger.error('Synthesis failed:', error);
      throw error;
    }
  }

  @Get('audio/:hash')
  async getAudio(@Param('hash') hash: string, @Res() res: Response) {
    this.logger.log(`Audio request for hash: ${hash}`);
    
    try {
      // Validate hash format (should be MD5 hex string)
      if (!/^[a-f0-9]{32}$/.test(hash)) {
        throw new HttpException('Invalid hash format', HttpStatus.BAD_REQUEST);
      }

      const objectName = `audio/${hash}.wav`;
      const stream = await this.ttsService.getAudioStream(objectName);
      
      res.set({
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${hash}.wav"`,
      });
      
      stream.pipe(res);
    } catch (error) {
      this.logger.error('Audio retrieval failed:', error);
      throw error;
    }
  }
}




