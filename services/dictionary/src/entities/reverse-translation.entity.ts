import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({
  description: 'Обратный перевод из таблицы фраз (русский→китайский)',
})
export class ReverseTranslation {
  @Field(() => String, { description: 'Русский текст' })
  russian: string;

  @Field(() => String, { description: 'Китайский текст' })
  chinese: string;

  @Field(() => String, { nullable: true, description: 'Пиньинь' })
  pinyin?: string;
}

