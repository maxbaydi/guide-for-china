import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({
  description: 'Похожее слово (содержащее данный иероглиф)',
})
export class SimilarWord {
  @Field(() => ID)
  id: string;

  @Field(() => String, { description: 'Упрощенное написание' })
  simplified: string;

  @Field(() => String, { description: 'Пиньинь' })
  pinyin: string;

  @Field(() => String, { description: 'Основной перевод (первое определение)' })
  mainTranslation: string;
}

