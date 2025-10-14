import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Definition {
  @Field(() => ID)
  id: string;

  @Field()
  characterId: string;

  @Field()
  translation: string;

  @Field({ nullable: true })
  partOfSpeech?: string;

  @Field({ nullable: true })
  context?: string;

  @Field(() => Int)
  order: number;
}

