// src/comments/comments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @Patch(':id/mark-solution')
  markAsSolution(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.markAsSolution(id, req.user.id);
  }

  @Post(':id/toggle-like')
  toggleLike(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.toggleLike(id, req.user.id);
  }

  // GET /comments/post/:postId - Get all comments for a post with nested structure
  @Get('post/:postId')
  getCommentsByPost(@Param('postId', ParseIntPipe) postId: number, @Request() req) {
    return this.commentsService.getByPostId(postId, req.user?.id);
  }

  // PATCH /comments/:id - Update comment content
  @Patch(':id')
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    return this.commentsService.updateComment(id, updateCommentDto.content, req.user.id);
  }

  // DELETE /comments/:id - Soft delete comment
  @Delete(':id')
  deleteComment(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.deleteComment(id, req.user.id);
  }
}