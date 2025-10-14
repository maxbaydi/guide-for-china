import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { CollectionService } from './services/collection.service';
import { CollectionResolver } from './resolvers/collection.resolver';
import { CollectionItemResolver } from './resolvers/collection-item.resolver';

@Module({
  imports: [HttpModule],
  providers: [
    UserService,
    UserResolver,
    CollectionService,
    CollectionResolver,
    CollectionItemResolver,
  ],
  exports: [UserService, CollectionService],
})
export class UserModule {}

