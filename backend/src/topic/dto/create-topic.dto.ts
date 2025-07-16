import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;
}