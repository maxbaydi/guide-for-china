import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Definition {
  @Field(() => ID)
  id: string;

  @Field()
  characterId: string;

  @Field()
  translation: string;

  @Field(() => Int)
  order: number;
}

