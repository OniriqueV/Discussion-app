import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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