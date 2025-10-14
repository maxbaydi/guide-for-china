import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

// Минимальная информация об иероглифе для коллекций
@ObjectType()
export class CharacterInCollection {
  @Field(() => ID)
  id: string;

  @Field()
  simplified: string;

  @Field({ nullable: true })
  pinyin?: string;

  @Field(() => [String])
  definitions: string[];

  @Field(() => Int, { nullable: true })
  hskLevel?: number;
}

@ObjectType()
export class CollectionItem {
  @Field(() => ID)
  id: string;

  @Field()
  collectionId: string;

  @Field()
  characterId: string;

  @Field(() => CharacterInCollection, { nullable: true })
  character?: CharacterInCollection;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  addedAt: Date;

  @Field(() => Int)
  sortOrder: number;
}

