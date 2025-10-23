import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
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
          prefix: 'tts_service_',
        },
      },
      defaultLabels: {
        app: 'tts-service',
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

    // TTS module
    TtsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}







