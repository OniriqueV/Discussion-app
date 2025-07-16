import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import slugify from 'slugify';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTopicDto) {
    // Kiểm tra topic đã tồn tại
    const existingTopic = await this.prisma.topic.findFirst({
      where: { 
        name: dto.name,
        deleted_at: null 
      }
    });

    if (existingTopic) {
      throw new ConflictException('Topic with this name already exists');
    }

    const slug = slugify(dto.name, { lower: true, strict: true });
    
    // Kiểm tra slug đã tồn tại
    const existingSlug = await this.prisma.topic.findFirst({
      where: { 
        slug,
        deleted_at: null 
      }
    });

    if (existingSlug) {
      throw new ConflictException('Topic with this slug already exists');
    }

    try {
      return await this.prisma.topic.create({
        data: {
          name: dto.name,
          slug,
        },
      });
    } catch (error) {
      throw new ConflictException('Failed to create topic');
    }
  }

  async findAll() {
    return this.prisma.topic.findMany({
      where: { deleted_at: null },
      include: {
        posts: {
          where: { deleted_at: null },
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
            views: true,
            is_pinned: true,
          }
        },
        _count: {
          select: {
            posts: {
              where: { deleted_at: null }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async findBySlug(slug: string) {
    const topic = await this.prisma.topic.findFirst({
      where: { slug, deleted_at: null },
      include: {
        posts: {
          where: { deleted_at: null },
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
            views: true,
            is_pinned: true,
          }
        },
        _count: {
          select: {
            posts: {
              where: { deleted_at: null }
            }
          }
        }
      }
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async update(slug: string, dto: UpdateTopicDto) {
    const topic = await this.findBySlug(slug);

    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Name is required');
    }

    // Kiểm tra name mới có bị trùng không
    if (dto.name && dto.name !== topic.name) {
      const existingTopic = await this.prisma.topic.findFirst({
        where: { 
          name: dto.name,
          deleted_at: null,
          id: { not: topic.id }
        }
      });

      if (existingTopic) {
        throw new ConflictException('Topic with this name already exists');
      }
    }

    const newSlug = dto.name ? slugify(dto.name, { lower: true, strict: true }) : topic.slug;

    // Kiểm tra slug mới có bị trùng không
    if (newSlug !== topic.slug) {
      const existingSlug = await this.prisma.topic.findFirst({
        where: { 
          slug: newSlug,
          deleted_at: null,
          id: { not: topic.id }
        }
      });

      if (existingSlug) {
        throw new ConflictException('Topic with this slug already exists');
      }
    }

    try {
      return await this.prisma.topic.update({
        where: { id: topic.id },
        data: {
          ...dto,
          slug: newSlug,
        },
      });
    } catch (error) {
      throw new ConflictException('Failed to update topic');
    }
  }

  async softDelete(slug: string) {
    const topic = await this.findBySlug(slug);

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Soft delete tất cả posts thuộc topic này
        await prisma.post.updateMany({
          where: { 
            topic_id: topic.id,
            deleted_at: null
          },
          data: { deleted_at: new Date() },
        });

        // Soft delete topic
        return await prisma.topic.update({
          where: { id: topic.id },
          data: { deleted_at: new Date() },
        });
      });
    } catch (error) {
      throw new ConflictException('Failed to delete topic');
    }
  }

  async softDeleteMany(dto: BulkDeleteDto) {
    if (!dto.slugs || dto.slugs.length === 0) {
      throw new BadRequestException('Slugs array cannot be empty');
    }

    // Tìm tất cả topics cần xóa
    const topics = await this.prisma.topic.findMany({
      where: { 
        slug: { in: dto.slugs },
        deleted_at: null 
      },
      select: { id: true, slug: true }
    });

    if (topics.length === 0) {
      throw new NotFoundException('No topics found to delete');
    }

    const foundSlugs = topics.map(t => t.slug);
    const notFoundSlugs = dto.slugs.filter(slug => !foundSlugs.includes(slug));

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const topicIds = topics.map(t => t.id);

        // Soft delete tất cả posts thuộc các topics này
        await prisma.post.updateMany({
          where: { 
            topic_id: { in: topicIds },
            deleted_at: null
          },
          data: { deleted_at: new Date() },
        });

        // Soft delete topics
        const deletedTopics = await prisma.topic.updateMany({
          where: { 
            id: { in: topicIds },
            deleted_at: null 
          },
          data: { deleted_at: new Date() },
        });

        return {
          deletedCount: deletedTopics.count,
          deletedSlugs: foundSlugs,
          notFoundSlugs,
        };
      });

      return result;
    } catch (error) {
      throw new ConflictException('Failed to bulk delete topics');
    }
  }

  async getTopicStats() {
    const stats = await this.prisma.topic.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true,
        _count: {
          select: {
            posts: {
              where: { deleted_at: null }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    });

    return stats;
  }
}