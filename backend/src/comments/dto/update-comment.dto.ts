// src/comments/dto/update-comment.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(5000, { message: 'Comment content cannot exceed 5000 characters' })
  content: string;
}