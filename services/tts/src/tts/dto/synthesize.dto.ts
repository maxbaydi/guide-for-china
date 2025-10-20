import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SynthesizeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Text is too long. Maximum 100 characters allowed.' })
  text: string;
}






