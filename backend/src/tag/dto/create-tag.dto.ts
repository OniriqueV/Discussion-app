import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores'
  })
  name: string;
}