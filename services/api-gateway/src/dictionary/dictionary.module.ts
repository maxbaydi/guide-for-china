import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const baseUrl = configService.get<string>('DICTIONARY_SERVICE_URL') || 'http://dictionary-service:4001';
        // Remove trailing slash if present
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return {
          baseURL: cleanBaseUrl,
          timeout: 60000, // Увеличен до 60 секунд для сложных запросов
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
    RedisModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}

