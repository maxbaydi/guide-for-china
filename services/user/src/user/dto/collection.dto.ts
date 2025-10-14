import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength } from 'class-validator';

@InputType()
export class CreateCollectionInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

@InputType()
export class UpdateCollectionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

@InputType()
export class AddToCollectionInput {
  @Field()
  @IsString()
  characterId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

