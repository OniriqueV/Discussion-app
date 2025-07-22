import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPostDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  topic_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  company_id?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_pinned?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}