import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';

@Module({
  imports: [ConfigModule],
  controllers: [TtsController],
  providers: [TtsService],
})
export class TtsModule {}







