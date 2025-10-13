import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Phrase {
  @Field(() => ID)
  id: string;

  @Field()
  russian: string;

  @Field()
  chinese: string;

  @Field({ nullable: true })
  pinyin?: string;

  @Field({ nullable: true })
  context?: string;

  @Field()
  createdAt: Date;
}

