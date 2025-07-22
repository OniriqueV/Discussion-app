// src/comments/dto/create-comment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  post_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsInt()
  parent_id?: number;

  @IsOptional()
  @IsBoolean()
  is_solution?: boolean;
}