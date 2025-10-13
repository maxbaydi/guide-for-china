import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Definition } from './definition.entity';
import { Example } from './example.entity';

@ObjectType()
export class Character {
  @Field(() => ID)
  id: string;

  @Field()
  simplified: string;

  @Field({ nullable: true })
  traditional?: string;

  @Field({ nullable: true })
  pinyin?: string;

  @Field(() => Int, { nullable: true })
  hskLevel?: number;

  @Field(() => Int, { nullable: true })
  frequency?: number;

  @Field(() => [Definition])
  definitions: Definition[];

  @Field(() => [Example])
  examples: Example[];

  @Field()
  createdAt: Date;
}

