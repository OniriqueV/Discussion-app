import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { BulkDeleteTagDto } from './dto/bulk-delete.dto';
import { SearchTagDto } from './dto/search-tag.dto';
import slugify from 'slugify';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    // Kiểm tra tag đã tồn tại
    const existingTag = await this.prisma.tag.findFirst({
      where: { 
        name: {
          equals: dto.name,
          mode: 'insensitive'
        },
        deleted_at: null 
      }
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const slug = slugify(dto.name, { lower: true, strict: true });
    
    // Kiểm tra slug đã tồn tại
    const existingSlug = await this.prisma.tag.findFirst({
      where: { 
        slug,
        deleted_at: null 
      }
    });

    if (existingSlug) {
      throw new ConflictException('Tag with this slug already exists');
    }

    try {
      return await this.prisma.tag.create({
        data: {
          name: dto.name,
          slug,
        },
        include: {
          _count: {
            select: {
              post_tags: true
            }
          }
        }
      });
    } catch (error) {
      throw new ConflictException('Failed to create tag');
    }
  }

  async findAll(query: SearchTagDto) {
    const { search, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const whereClause = {
      deleted_at: null,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const
        }
      })
    };
    
    const safeSortBy = (() => {
      switch (sortBy) {
        case 'postsCount':
          return { post_tags: { _count: sortOrder } };
        case 'createdAt':
        case 'created_at':
          return { created_at: sortOrder };

        case 'name':
          return { name: sortOrder };
        default:
          return { created_at: 'desc' };
      }
    })();


 const sortMapping: Record<string, keyof Prisma.TagOrderByWithRelationInput> = {
  createdAt: 'created_at',
  name: 'name',
};

const orderByClause: Prisma.TagOrderByWithRelationInput =
  sortBy === 'postsCount'
    ? { post_tags: { _count: sortOrder as Prisma.SortOrder } }
    : sortMapping[sortBy]
    ? { [sortMapping[sortBy]]: sortOrder as Prisma.SortOrder }
    : { created_at: 'desc' as Prisma.SortOrder };

const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where: whereClause,
        include: {
          post_tags: {
            where: {
              post: {
                deleted_at: null,
              },
            },
            select: {
              post: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  created_at: true,
                  views: true,
                  is_pinned: true,
                },
              },
            },
          },
          _count: {
            select: {
              post_tags: {
                where: {
                  post: {
                    deleted_at: null,
                  },
                },
              },
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      this.prisma.tag.count({
        where: whereClause,
      }),
    ]);


    return {
      data: tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    };
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { slug, deleted_at: null },
      include: {
        post_tags: {
          where: {
            post: {
              deleted_at: null
            }
          },
          select: {
            post: {
              select: {
                id: true,
                title: true,
                status: true,
                created_at: true,
                views: true,
                is_pinned: true,
                user: {
                  select: {
                    id: true,
                    full_name: true,
                    avatar: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            post_tags: {
              where: {
                post: {
                  deleted_at: null
                }
              }
            }
          }
        }
      }
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(slug: string, dto: UpdateTagDto) {
    const tag = await this.findBySlug(slug);

    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Name is required');
    }

    // Kiểm tra name mới có bị trùng không
    if (dto.name && dto.name.toLowerCase() !== tag.name.toLowerCase()) {
      const existingTag = await this.prisma.tag.findFirst({
        where: { 
          name: {
            equals: dto.name,
            mode: 'insensitive'
          },
          deleted_at: null,
          id: { not: tag.id }
        }
      });

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists');
      }
    }

    const newSlug = dto.name ? slugify(dto.name, { lower: true, strict: true }) : tag.slug;

    // Kiểm tra slug mới có bị trùng không
    if (newSlug !== tag.slug) {
      const existingSlug = await this.prisma.tag.findFirst({
        where: { 
          slug: newSlug,
          deleted_at: null,
          id: { not: tag.id }
        }
      });

      if (existingSlug) {
        throw new ConflictException('Tag with this slug already exists');
      }
    }

    try {
      return await this.prisma.tag.update({
        where: { id: tag.id },
        data: {
          ...dto,
          slug: newSlug,
        },
        include: {
          _count: {
            select: {
              post_tags: {
                where: {
                  post: {
                    deleted_at: null
                  }
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new ConflictException('Failed to update tag');
    }
  }

  async softDelete(slug: string) {
    const tag = await this.findBySlug(slug);

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Xóa tất cả post_tags liên quan
        await prisma.postTag.deleteMany({
          where: { tag_id: tag.id }
        });

        // Soft delete tag
        return await prisma.tag.update({
          where: { id: tag.id },
          data: { deleted_at: new Date() },
        });
      });
    } catch (error) {
      throw new ConflictException('Failed to delete tag');
    }
  }

  async softDeleteMany(dto: BulkDeleteTagDto) {
    if (!dto.slugs || dto.slugs.length === 0) {
      throw new BadRequestException('Slugs array cannot be empty');
    }

    // Tìm tất cả tags cần xóa
    const tags = await this.prisma.tag.findMany({
      where: { 
        slug: { in: dto.slugs },
        deleted_at: null 
      },
      select: { id: true, slug: true }
    });

    if (tags.length === 0) {
      throw new NotFoundException('No tags found to delete');
    }

    const foundSlugs = tags.map(t => t.slug);
    const notFoundSlugs = dto.slugs.filter(slug => !foundSlugs.includes(slug));

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const tagIds = tags.map(t => t.id);

        // Xóa tất cả post_tags liên quan
        await prisma.postTag.deleteMany({
          where: { tag_id: { in: tagIds } }
        });

        // Soft delete tags
        const deletedTags = await prisma.tag.updateMany({
          where: { 
            id: { in: tagIds },
            deleted_at: null 
          },
          data: { deleted_at: new Date() },
        });

        return {
          deletedCount: deletedTags.count,
          deletedSlugs: foundSlugs,
          notFoundSlugs,
        };
      });

      return result;
    } catch (error) {
      throw new ConflictException('Failed to bulk delete tags');
    }
  }

  async getTagStats() {
    const stats = await this.prisma.tag.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true,
        _count: {
          select: {
            post_tags: {
              where: {
                post: {
                  deleted_at: null
                }
              }
            }
          }
        }
      },
      orderBy: {
        post_tags: {
          _count: 'desc'
        }
      }
    });

    const totalTags = stats.length;
    const totalPosts = stats.reduce((sum, tag) => sum + tag._count.post_tags, 0);
    const avgPostsPerTag = totalTags > 0 ? totalPosts / totalTags : 0;

    return {
      totalTags,
      totalPosts,
      avgPostsPerTag: Math.round(avgPostsPerTag * 100) / 100,
      tags: stats
    };
  }

  async getPopularTags(limit: number = 10) {
    return this.prisma.tag.findMany({
      where: { deleted_at: null },
      include: {
        _count: {
          select: {
            post_tags: {
              where: {
                post: {
                  deleted_at: null
                }
              }
            }
          }
        }
      },
      orderBy: {
        post_tags: {
          _count: 'desc'
        }
      },
      take: limit
    });
  }
}