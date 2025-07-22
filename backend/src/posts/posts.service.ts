import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { sendEmail } from 'src/utils/emails';


@Injectable()
export class PostsService {
    
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: number, companyId?: number) {
    const { tag_ids, ...postData } = createPostDto;

    // Create post
    const post = await this.prisma.post.create({
      data: {
        ...postData,
        user_id: userId,
        company_id: companyId,
        status: 'problem'
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true }
        },
        topic: {
          select: { id: true, name: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      await this.prisma.postTag.createMany({
        data: tag_ids.map(tag_id => ({
          post_id: post.id,
          tag_id
        }))
      });
    }

    return this.findOne(post.id);
  }

  async findAll(queryDto: QueryPostDto, userRole?: string, companyId?: number) {
    const { page=1, limit=10, status, topic_id, company_id, is_pinned, search } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null
    };

    // Role-based filtering
    if (userRole !== 'admin') {
      where.OR = [
        { status: { in: ['problem', 'solve'] } },
        { company_id: companyId }
      ];
    }

    if (status) where.status = status;
    if (topic_id) where.topic_id = topic_id;
    if (company_id) where.company_id = company_id;
    if (is_pinned !== undefined) where.is_pinned = is_pinned;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { is_pinned: 'desc' },
          { created_at: 'desc' }
        ],
        include: {
          user: {
            select: { id: true, full_name: true, email: true, avatar: true }
          },
          topic: {
            select: { id: true, name: true, slug: true }
          },
          company: {
            select: { id: true, name: true }
          },
          post_tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          _count: {
            select: {
              comments: { where: { deleted_at: null } },
              user_points: true
            }
          }
        }
      }),
      this.prisma.post.count({ where })
    ]);

    return {
      data: posts.map(post => ({
        ...post,
        tags: post.post_tags.map(pt => pt.tag),
        post_tags: undefined,
        comments_count: post._count.comments,
        points: post._count.user_points
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar: true }
        },
        topic: {
          select: { id: true, name: true, slug: true }
        },
        company: {
          select: { id: true, name: true }
        },
        post_tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        comments: {
          where: { deleted_at: null, parent_id: null },
          include: {
            user: {
              select: { id: true, full_name: true, avatar: true }
            },
            replies: {
              where: { deleted_at: null },
              include: {
                user: {
                  select: { id: true, full_name: true, avatar: true }
                },
                _count: {
                  select: { comment_likes: true }
                }
              }
            },
            _count: {
              select: { comment_likes: true }
            }
          },
          orderBy: { created_at: 'desc' }
        },
        _count: {
          select: {
            comments: { where: { deleted_at: null } },
            user_points: true
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    return {
      ...post,
      tags: post.post_tags.map(pt => pt.tag),
      post_tags: undefined,
      comments_count: post._count.comments,
      points: post._count.user_points
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number, userRole: string, companyId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
      include: { user: true }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check permissions - only author can edit
    if (post.user_id !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const { tag_ids, ...postData } = updatePostDto;

    // Update post
    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        updated_at: new Date()
      }
    });

    // Update tags if provided
    if (tag_ids !== undefined) {
      // Remove existing tags
      await this.prisma.postTag.deleteMany({
        where: { post_id: id }
      });

      // Add new tags
      if (tag_ids.length > 0) {
        await this.prisma.postTag.createMany({
          data: tag_ids.map(tag_id => ({
            post_id: id,
            tag_id
          }))
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number, userRole: string, companyId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
      include: { 
        user: { select: { id: true, full_name: true, email: true } },
        company: { select: { id: true, name: true } }
      }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check permissions
    const canDelete = post.user_id === userId || 
                     userRole === 'admin' || 
                     (userRole === 'ca_user' && post.company_id === companyId);

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    // Soft delete
    await this.prisma.post.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    // Send email notification to post author if deleted by admin/ca_user
    if (post.user_id !== userId && post.user?.email) {
      const deleterType = userRole === 'admin' ? 'Administrator' : 'Company Admin';
      await sendEmail(
        post.user.email,
        'Your Post Has Been Deleted',
        `Dear ${post.user.full_name || 'User'},

Your post "${post.title}" has been deleted by ${deleterType}.

If you have any questions, please contact support.

Best regards,
The Team`
      );
    }

    return { message: 'Post deleted successfully' };
  }

  async updateStatus(id: number, status: string, rejectedBy?: number) {
    const validStatuses = ['problem', 'solve', 'reject_by_admin_or_company_acc'];
    
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
      include: { user: { select: { email: true, full_name: true } } }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        status,
        rejected_by: status === 'reject_by_admin_or_company_acc' ? rejectedBy : null,
        updated_at: new Date()
      }
    });

    // Send email notification for status changes
    if (post.user?.email) {
      let subject = '';
      let body = '';

      switch (status) {
        case 'solve':
          subject = 'Your Post Has Been Marked as Solved';
          body = `Your post "${post.title}" has been marked as solved.`;
          break;
        case 'reject_by_admin_or_company_acc':
          subject = 'Your Post Has Been Rejected';
          body = `Your post "${post.title}" has been rejected. Please review and update your post.`;
          break;
      }

      if (subject && body) {
        await sendEmail(post.user.email, subject, body);
      }
    }

    return updatedPost;
  }

  async togglePin(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        is_pinned: !post.is_pinned,
        updated_at: new Date()
      }
    });
  }

  async getPostsByUser(userId: number, queryDto: QueryPostDto) {
    const { page=1, limit=10, status } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {
      user_id: userId,
      deleted_at: null
    };

    if (status) where.status = status;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          topic: {
            select: { id: true, name: true, slug: true }
          },
          post_tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          _count: {
            select: {
              comments: { where: { deleted_at: null } },
              user_points: true
            }
          }
        }
      }),
      this.prisma.post.count({ where })
    ]);

    return {
      data: posts.map(post => ({
        ...post,
        tags: post.post_tags.map(pt => pt.tag),
        post_tags: undefined,
        comments_count: post._count.comments,
        points: post._count.user_points
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}