import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Character } from './character.entity';

@ObjectType()
export class CharacterAnalysis {
  @Field()
  character: string;

  @Field(() => Character, { nullable: true })
  details?: Character;

  @Field(() => Int)
  position: number;
}

