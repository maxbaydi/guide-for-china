import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`\n🚀 HanGuide API Gateway is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📈 Metrics endpoint: http://localhost:${port}/metrics`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/api/v1/auth/*`);
  console.log(`📚 Dictionary endpoints: http://localhost:${port}/api/v1/dictionary/*\n`);
}

bootstrap();
