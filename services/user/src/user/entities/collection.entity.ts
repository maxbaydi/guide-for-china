import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { CollectionItem } from './collection-item.entity';

@ObjectType()
export class Collection {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field()
  isPublic: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [CollectionItem], { nullable: true })
  items?: CollectionItem[];

  @Field(() => Int, { description: 'Total number of items in collection' })
  itemCount?: number;
}

