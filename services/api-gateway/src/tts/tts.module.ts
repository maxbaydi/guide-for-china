import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const baseUrl = configService.get<string>('TTS_SERVICE_URL') || 'http://tts-service:4003';
        // Remove trailing slash if present
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return {
          baseURL: cleanBaseUrl,
          timeout: 30000, // 30 seconds timeout for TTS requests
          maxRedirects: 5,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    RedisModule,
  ],
  controllers: [TtsController],
  providers: [TtsService],
})
export class TtsModule {}
