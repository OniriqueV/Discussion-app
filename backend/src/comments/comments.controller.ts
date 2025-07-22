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
}