import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const {
        name,
        address,
        status,
        max_users,
        expired_time,
        logo,
      } = createCompanyDto;

      return await this.prisma.company.create({
        data: {
          name,
          address,
          status,
          max_users,
          expired_time: expired_time ? new Date(expired_time) : undefined,
          logo,
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              status: true,
            },
          },
          _count: {
            select: {
              users: true,
              posts: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Company name already exists');
        }
      }
      throw error;
    }
  }


  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.CompanyWhereInput = {
      deleted_at: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              status: true,
            },
          },
          _count: {
            select: {
              users: true,
              posts: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findFirst({
      where: { id, deleted_at: null },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            status: true,
            created_at: true,
          },
        },
        posts: {
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            users: true,
            posts: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const existingCompany = await this.findOne(id);
    
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
        ...updateCompanyDto,
        max_users: updateCompanyDto.max_users
          ? Number(updateCompanyDto.max_users)
          : undefined,
        expired_time: updateCompanyDto.expired_time
          ? new Date(updateCompanyDto.expired_time)
          : undefined,
      },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              status: true,
            },
          },
          _count: {
            select: {
              users: true,
              posts: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Company name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    
    // Check if company has active users
    const activeUsers = await this.prisma.user.count({
      where: {
        company_id: id,
        status: 'active',
        deleted_at: null,
      },
    });

    if (activeUsers > 0) {
      throw new BadRequestException(
        `Cannot delete company. It has ${activeUsers} active users.`
      );
    }

    // Soft delete
    return await this.prisma.company.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status: 'inactive',
      },
    });
  }

  async uploadLogo(id: number, logoUrl: string) {
    const company = await this.findOne(id);
    
    return await this.prisma.company.update({
      where: { id },
      data: { logo: logoUrl },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async getCompanyStats(id: number) {
    const company = await this.findOne(id); // đảm bảo công ty tồn tại

    const stats = await this.prisma.company.findUnique({
        where: { id },
        select: {
        id: true,
        name: true,
        _count: {
            select: {
            users: true,
            posts: true,
            },
        },
        users: {
            select: {
            role: true,
            status: true,
            },
        },
        posts: {
            select: {
            status: true,
            created_at: true,
            },
        },
        },
    });

    if (!stats) {
        throw new NotFoundException(`Stats not found for company ID ${id}`);
    }

    const usersByRole = stats.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const usersByStatus = stats.users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const postsByStatus = stats.posts.reduce((acc, post) => {
        if (post.status) {
        acc[post.status] = (acc[post.status] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return {
        company: {
        id: stats.id,
        name: stats.name,
        },
        totalUsers: stats._count.users,
        totalPosts: stats._count.posts,
        usersByRole,
        usersByStatus,
        postsByStatus,
    };
    }

}