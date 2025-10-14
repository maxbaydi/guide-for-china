import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CollectionService } from '../services/collection.service';
import { Collection } from '../entities/collection.entity';
import { CollectionItem } from '../entities/collection-item.entity';
import {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddToCollectionInput,
} from '../dto/collection.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Resolver(() => Collection)
@UseGuards(JwtAuthGuard)
export class CollectionResolver {
  constructor(private collectionService: CollectionService) {}

  @Mutation(() => Collection)
  async createCollection(
    @Args('input') input: CreateCollectionInput,
    @CurrentUser() user: User,
  ): Promise<Collection> {
    return this.collectionService.createCollection(user.id, input);
  }

  @Query(() => [Collection])
  async myCollections(@CurrentUser() user: User): Promise<Collection[]> {
    return this.collectionService.getUserCollections(user.id);
  }

  @Query(() => Collection)
  async collection(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Collection> {
    return this.collectionService.getCollection(id, user.id);
  }

  @Mutation(() => Collection)
  async updateCollection(
    @Args('id') id: string,
    @Args('input') input: UpdateCollectionInput,
    @CurrentUser() user: User,
  ): Promise<Collection> {
    return this.collectionService.updateCollection(id, user.id, input);
  }

  @Mutation(() => Boolean)
  async deleteCollection(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.collectionService.deleteCollection(id, user.id);
  }

  @Mutation(() => CollectionItem)
  async addToCollection(
    @Args('collectionId') collectionId: string,
    @Args('input') input: AddToCollectionInput,
    @CurrentUser() user: User,
  ): Promise<CollectionItem> {
    return this.collectionService.addCharacterToCollection(collectionId, user.id, input);
  }

  @Mutation(() => Boolean)
  async removeFromCollection(
    @Args('collectionId') collectionId: string,
    @Args('characterId') characterId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.collectionService.removeCharacterFromCollection(
      collectionId,
      characterId,
      user.id,
    );
  }

  @Mutation(() => CollectionItem)
  async updateCollectionItemNotes(
    @Args('collectionId') collectionId: string,
    @Args('characterId') characterId: string,
    @Args('notes') notes: string,
    @CurrentUser() user: User,
  ): Promise<CollectionItem> {
    return this.collectionService.updateCollectionItemNotes(
      collectionId,
      characterId,
      user.id,
      notes,
    );
  }

  @Query(() => [Collection])
  async characterCollections(
    @Args('characterId') characterId: string,
    @CurrentUser() user: User,
  ): Promise<Collection[]> {
    return this.collectionService.getCharacterCollections(characterId, user.id);
  }
}

