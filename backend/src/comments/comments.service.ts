// src/comments/comments.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { sendEmail } from 'src/utils/emails';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const { post_id, parent_id, ...commentData } = createCommentDto;

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: post_id, deleted_at: null },
      include: { user: { select: { email: true, full_name: true } } }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If replying to a comment, check if parent comment exists
    if (parent_id) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parent_id, deleted_at: null }
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.post_id !== post_id) {
        throw new ForbiddenException('Parent comment does not belong to this post');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        ...commentData,
        post_id,
        parent_id,  // Thêm parent_id để hỗ trợ nested comments
        user_id: userId
      },
      include: {
        user: {
          select: { 
            id: true, 
            full_name: true, 
            email: true,
            avatar: true 
          }
        },
        _count: {
          select: {
            comment_likes: true
          }
        }
      }
    });

    // Return comment with formatted data
    return {
      ...comment,
      likes: comment._count.comment_likes,
      dislikes: 0, // Nếu cần hỗ trợ dislike
      isLiked: false,
      isDisliked: false
    };
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

    // Only post author, admin, or ca_user can mark solution
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const canMarkSolution = comment.post?.user?.id === userId || 
                           user?.role === 'admin' || 
                           user?.role === 'ca_user';

    if (!canMarkSolution) {
      throw new ForbiddenException('Only the post author, admin, or ca_user can mark solutions');
    }

    const isCurrentlySolution = comment.is_solution;

    if (isCurrentlySolution) {
      // Unmark as solution
      const updatedComment = await this.prisma.comment.update({
        where: { id: commentId },
        data: { is_solution: false }
      });

      // Remove point from comment author
      await this.prisma.userPoint.deleteMany({
        where: { 
          user_id: comment.user?.id,
          comment_id: commentId 
        }
      });

      // Check if there are other solutions for this post
      const otherSolutions = await this.prisma.comment.findMany({
        where: { 
          post_id: comment.post_id,
          is_solution: true,
          deleted_at: null
        }
      });

      // If no other solutions, change post status back to 'problem'
      if (otherSolutions.length === 0) {
        await this.prisma.post.update({
          where: { id: comment.post_id  ?? undefined },
          data: { status: 'problem' }
        });
      }

      return updatedComment;
    } else {
      // Mark as solution
      const updatedComment = await this.prisma.comment.update({
        where: { id: commentId },
        data: { is_solution: true }
      });

      // Award point to comment author (avoid duplicate points)
      if (comment.user?.id) {
        const existingPoint = await this.prisma.userPoint.findFirst({
          where: {
            user_id: comment.user.id,
            comment_id: commentId
          }
        });

        if (!existingPoint) {
          await this.prisma.userPoint.create({
            data: {
              user_id: comment.user.id,
              comment_id: commentId,
              point: 1
            }
          });
        }
      }

      // Update post status to 'solve' (theo database schema)
      await this.prisma.post.update({
        where: { id: comment.post_id  ?? undefined },
        data: { status: 'solve' }
      });

      // Send email notification
      if (comment.user?.email) {
        try {
          await sendEmail(
            comment.user.email,
            'Your Comment Was Marked as Solution!',
            `Congratulations ${comment.user.full_name}! Your comment has been marked as the solution and you've earned 1 point.`
          );
        } catch (error) {
          console.error('Failed to send email notification:', error);
          // Don't throw error as the main functionality should still work
        }
      }

      return updatedComment;
    }
  }

  async toggleLike(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deleted_at: null }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.commentLike.findFirst({
      where: { comment_id: commentId, user_id: userId }
    });

    if (existingLike) {
      // Unlike
      await this.prisma.commentLike.delete({
        where: { id: existingLike.id }
      });
    } else {
      // Like
      await this.prisma.commentLike.create({
        data: { comment_id: commentId, user_id: userId }
      });
    }

    // Get updated like count
    const likeCount = await this.prisma.commentLike.count({
      where: { comment_id: commentId }
    });

    return { 
      likes: likeCount,
      isLiked: !existingLike // true if we just liked, false if we just unliked
    };
  }

  async getByPostId(postId: number, userId?: number) {
    // Get all comments for the post (including nested ones)
    const allComments = await this.prisma.comment.findMany({
      where: {
        post_id: postId,
        deleted_at: null
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            avatar: true
          }
        },
        comment_likes: userId ? {
          where: { user_id: userId },
          select: { id: true }
        } : false,
        _count: {
          select: {
            comment_likes: true
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    // Build nested structure
    const commentMap = new Map();
    // const rootComments = [];
    const rootComments: any[] = [];


    // First pass: create map of all comments
    allComments.forEach(comment => {
      const formattedComment = {
        ...comment,
        likes: comment._count.comment_likes,
        dislikes: 0, // Placeholder for future dislike functionality
        isLiked: userId ? (comment.comment_likes && comment.comment_likes.length > 0) : false,
        isDisliked: false, // Placeholder
        replies: []
      };

      // Remove the _count and comment_likes from the response
      delete (formattedComment as any).comment_likes;
      delete (formattedComment as any)._count;

      commentMap.set(comment.id, formattedComment);
    });

    // Second pass: build nested structure
    commentMap.forEach(comment => {
      if (comment.parent_id) {
        // This is a reply
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        // This is a root comment
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  async updateComment(commentId: number, content: string, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deleted_at: null },
      include: {
        user: { select: { id: true } }
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment or is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (comment.user?.id !== userId && user?.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return updatedComment;
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deleted_at: null },
      include: {
        user: { select: { id: true } },
        replies: { where: { deleted_at: null } }
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user owns the comment or is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (comment.user?.id !== userId && user?.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete the comment and its replies
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deleted_at: new Date() }
    });

    // Also soft delete all replies
    if (comment.replies && comment.replies.length > 0) {
      await this.prisma.comment.updateMany({
        where: { parent_id: commentId },
        data: { deleted_at: new Date() }
      });
    }

    // If this was a solution, remove the point and update post status if needed
    if (comment.is_solution) {
      await this.prisma.userPoint.deleteMany({
        where: {
          user_id: comment.user?.id,
          comment_id: commentId
        }
      });

      // Check if there are other solutions
      const otherSolutions = await this.prisma.comment.findMany({
        where: {
          post_id: comment.post_id,
          is_solution: true,
          deleted_at: null
        }
      });

      if (otherSolutions.length === 0) {
        await this.prisma.post.update({
          where: { id: comment.post_id  ?? undefined },
          data: { status: 'problem' }
        });
      }
    }

    return { message: 'Comment deleted successfully' };
  }
}