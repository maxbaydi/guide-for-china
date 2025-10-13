import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Example {
  @Field(() => ID)
  id: string;

  @Field()
  characterId: string;

  @Field()
  chinese: string;

  @Field({ nullable: true })
  pinyin?: string;

  @Field()
  russian: string;

  @Field({ nullable: true })
  source?: string;
}

