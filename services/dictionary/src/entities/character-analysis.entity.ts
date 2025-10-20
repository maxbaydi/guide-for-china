import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Character } from './character.entity';

@ObjectType()
export class CharacterAnalysis {
  @Field({ description: 'Слово или иероглиф из текста' })
  word: string;

  @Field(() => Character, { nullable: true, description: 'Детали слова из словаря (если найдено)' })
  details?: Character;

  @Field(() => Int, { description: 'Позиция слова в тексте' })
  position: number;
}

