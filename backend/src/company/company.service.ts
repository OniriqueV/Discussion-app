import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  private async checkCompanyAccess(user: any, companyId: number) {
  if (user.role === 'admin') return;

  if (user.role === 'ca_user') {
    const isMember = await this.prisma.user.findFirst({
      where: {
        id: user.sub, // hoặc user.id nếu bạn parse rồi
        company_id: companyId,
        role: 'ca_user',
        deleted_at: null,
      },
    });

    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền với công ty này');
    }

    return;
  }

  throw new ForbiddenException('Bạn không có quyền truy cập');
}


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

  async findAll(page: number = 1, limit: number = 10, search?: string, user?: any) {
    const skip = (page - 1) * limit;
    
    let where: Prisma.CompanyWhereInput = {
      deleted_at: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Nếu là ca_user, chỉ hiển thị công ty của họ
    if (user && user.role === 'ca_user') {
      where.id = user.company_id;
    }

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
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, user?: any) {
    // Kiểm tra quyền truy cập
    if (user) {
      await this.checkCompanyAccess(user, id);
    }

    const company = await this.prisma.company.findFirst({
      where: {
        id,
        deleted_at: null,
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

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto, user?: any) {
    // Kiểm tra quyền truy cập
    if (user) {
      await this.checkCompanyAccess(user, id);
    }

    const existingCompany = await this.findOne(id);
    
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
        ...updateCompanyDto,
        ...(updateCompanyDto.max_users !== undefined && updateCompanyDto.max_users !== null
          ? { max_users: Number(updateCompanyDto.max_users) }
          : {}),
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

  async uploadLogo(id: number, logoUrl: string, user?: any) {
    // Kiểm tra quyền truy cập
    if (user) {
      await this.checkCompanyAccess(user, id);
    }

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

  async getCompanyStats(id: number, user?: any) {
    // Kiểm tra quyền truy cập
    if (user) {
      await this.checkCompanyAccess(user, id);
    }

    const company = await this.findOne(id);

    const [totalUsers, activeUsers, totalPosts, recentPosts] = await Promise.all([
      this.prisma.user.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.user.count({
        where: {
          company_id: id,
          status: 'active',
          deleted_at: null,
        },
      }),
      this.prisma.post.count({
        where: {
          company_id: id,
          deleted_at: null,
        },
      }),
      this.prisma.post.findMany({
        where: {
          company_id: id,
          deleted_at: null,
        },
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
      }),
    ]);

    return {
      company,
      stats: {
        totalUsers,
        activeUsers,
        totalPosts,
        recentPosts,
      },
    };
  }
}