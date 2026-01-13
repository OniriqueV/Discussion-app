// src/comments/dto/create-comment.dto.ts
import { IsString, IsInt, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  post_id: number;

  @IsString()
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(5000, { message: 'Comment content cannot exceed 5000 characters' })
  content: string;

  @IsOptional()
  @IsInt()
  parent_id?: number;
}