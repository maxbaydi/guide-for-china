import { Module } from '@nestjs/common';
import { DictionaryService } from './services/dictionary.service';
import { PrismaService } from './services/prisma.service';
import { DictionaryResolver } from './resolvers/dictionary.resolver';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [DictionaryService, PrismaService, DictionaryResolver],
  exports: [DictionaryService],
})
export class DictionaryModule {}

