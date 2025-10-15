import { Module } from '@nestjs/common';
import { DictionaryService } from './services/dictionary.service';
import { PrismaService } from './services/prisma.service';
import { DictionaryResolver } from './resolvers/dictionary.resolver';
import { DictionaryController } from './controllers/dictionary.controller';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [DictionaryController],
  providers: [DictionaryService, PrismaService, DictionaryResolver],
  exports: [DictionaryService],
})
export class DictionaryModule {}

