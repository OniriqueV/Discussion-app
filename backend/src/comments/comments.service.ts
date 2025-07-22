// src/comments/comments.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { sendEmail } from 'src/utils/emails';


@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const { post_id, ...commentData } = createCommentDto;

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: post_id, deleted_at: null },
      include: { user: { select: { email: true, full_name: true } } }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        ...commentData,
        post_id,
        user_id: userId
      },
      include: {
        user: {
          select: { id: true, full_name: true, avatar: true }
        }
      }
    });

    return comment;
  }

  async markAsSolution(commentId: number, userId: number) {
  const comment = await this.prisma.comment.findUnique({
    where: { id: commentId, deleted_at: null },
    include: { 
      post: { 
        include: { user: { select: { id: true } } } 
      },
      user: { 
        select: { id: true, email: true, full_name: true } 
      }
    }
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  // Only post author can mark solution
  if (!comment.post || !comment.post.user || comment.post.user.id !== userId) {
    throw new ForbiddenException('Only the post author can mark solutions');
  }

  // Unmark previous solutions
  await this.prisma.comment.updateMany({
    where: { post_id: comment.post_id, is_solution: true },
    data: { is_solution: false }
  });

  // Mark this comment as solution
  const updatedComment = await this.prisma.comment.update({
    where: { id: commentId },
    data: { is_solution: true }
  });

  // Award point to comment author
  if (!comment.user) {
    throw new NotFoundException('Comment author not found');
  }
  await this.prisma.userPoint.create({
    data: {
      user_id: comment.user.id,
      comment_id: commentId,
      point: 1
    }
  });

  // Update post status to solved
  if (!comment.post_id) {
    throw new NotFoundException('Post ID not found for comment');
  }
  await this.prisma.post.update({
    where: { id: comment.post_id },
    data: { status: 'solved' }
  });

  // Send email notification
  if (comment.user?.email) {
    await sendEmail(
      comment.user.email,
      'Your Comment Was Marked as Solution!',
      `Congratulations! Your comment has been marked as the solution and you've earned 1 point.`
    );
  }

  return updatedComment;
}

  async toggleLike(commentId: number, userId: number) {
    const existingLike = await this.prisma.commentLike.findFirst({
      where: { comment_id: commentId, user_id: userId }
    });

    if (existingLike) {
      await this.prisma.commentLike.delete({
        where: { id: existingLike.id }
      });
      return { liked: false };
    } else {
      await this.prisma.commentLike.create({
        data: { comment_id: commentId, user_id: userId }
      });
      return { liked: true };
    }
  }
}
