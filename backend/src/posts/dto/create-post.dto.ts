import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsInt()
  topic_id?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tag_ids?: number[];
}