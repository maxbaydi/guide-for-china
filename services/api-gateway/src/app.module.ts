import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { TtsModule } from './tts/tts.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prometheus metrics
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'api_gateway_',
        },
      },
      defaultLabels: {
        app: 'api-gateway',
        version: '1.0.0',
      },
    }),

    // Global throttling (requests per minute)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP
      },
    ]),

    // Redis for caching and rate limiting
    RedisModule,

    // Feature modules
    AuthModule,
    DictionaryModule,
    TtsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
