
// src/user/user.service.ts
import { 
  Injectable, 
  ForbiddenException, 
  ConflictException, 
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignCaUserDto } from './dto/assign-ca-user.dto';
import * as bcrypt from 'bcrypt';
import { sendEmail } from 'src/utils/emails';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface GetRankingDto {
  period?: 'total' | 'weekly' | 'monthly' | 'yearly';
  limit?: number;
  page?: number;
  company_id?: number;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, currentUser: any) {
    // Kiểm tra quyền tạo user
    await this.checkCreatePermission(dto, currentUser);

    // Validate email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Validate company exists if company_id is provided
    if (dto.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id }
      });

      if (!company) {
        throw new BadRequestException('Company không tồn tại');
      }

      // Check if company has reached max users limit
      const userCount = await this.prisma.user.count({
        where: { company_id: dto.company_id }
      });

      if (company.max_users && userCount >= company.max_users) {
        throw new BadRequestException('Company đã đạt giới hạn số lượng user');
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(dto.password, 12);

    // Create user data
    const userData = {
      email: dto.email,
      password_hash,
      full_name: dto.full_name,
      avatar: dto.avatar,
      role: dto.role,
      company_id: dto.company_id,
      day_of_birth: dto.day_of_birth ? new Date(dto.day_of_birth) : null,
    };

    const user = await this.prisma.user.create({ 
      data: userData,
      include: {
        company: true
      }
    });

    // Send welcome email
    const companyName = user.company ? user.company.name : 'N/A';
    await sendEmail(
      user.email,
      `Chào mừng bạn đến với hệ thống`,
      `Xin chào ${user.full_name || user.email},\n\nTài khoản của bạn đã được tạo thành công.\n\nThông tin tài khoản:\n- Email: ${user.email}\n- Vai trò: ${user.role}\n- Công ty: ${companyName}\n\nVui lòng đăng nhập để sử dụng hệ thống.\n\nTrân trọng!`
    );

    // Remove password_hash from response
    const { password_hash: _, ...userResponse } = user;
    return userResponse;
  }

  private async checkCreatePermission(dto: CreateUserDto, currentUser: any) {
    if (currentUser.role === 'admin') {
      // Admin có thể tạo bất kỳ user nào
      return;
    }

    if (currentUser.role === 'ca_user') {
      // ca_user chỉ có thể tạo member trong công ty của mình
      if (dto.role !== 'member') {
        throw new ForbiddenException('ca_user chỉ có thể tạo user với role member');
      }

      if (!dto.company_id || dto.company_id !== currentUser.company_id) {
        throw new ForbiddenException('ca_user chỉ có thể tạo user trong công ty của mình');
      }
      return;
    }

    // Member không có quyền tạo user
    throw new ForbiddenException('Bạn không có quyền tạo user');
  }

  async update(id: number, dto: UpdateUserDto, currentUser: any) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra quyền cập nhật user
    await this.checkUpdatePermission(existingUser, dto, currentUser);

    // Check email uniqueness if email is being updated
    if (dto.email && dto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email }
      });

      if (emailExists) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Validate company exists if company_id is being updated
    if (dto.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id }
      });

      if (!company) {
        throw new BadRequestException('Company không tồn tại');
      }
    }

    // Prepare update data
    const updateData = {
      ...dto,
      day_of_birth: dto.day_of_birth ? new Date(dto.day_of_birth) : undefined,
      updated_at: new Date(),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        company: true
      }
    });

    // Remove password_hash from response
    const { password_hash: _, ...userResponse } = updatedUser;
    return userResponse;
  }

  private async checkUpdatePermission(
  existingUser: any,
  dto: UpdateUserDto,
  currentUser: any
) {
  if (currentUser.role === 'admin') {
    // Admin có thể cập nhật bất kỳ user nào
    return;
  }

  if (currentUser.role === 'ca_user') {
    // ca_user chỉ có thể cập nhật user trong công ty của mình
    if (existingUser.company_id !== currentUser.company_id) {
      throw new ForbiddenException(
        'ca_user chỉ có thể cập nhật user trong công ty của mình'
      );
    }

    // ca_user không thể thay đổi role hoặc company_id
    if (dto.role && dto.role !== existingUser.role) {
      throw new ForbiddenException('ca_user không thể thay đổi role của user');
    }

    if (dto.company_id && dto.company_id !== currentUser.company_id) {
      throw new ForbiddenException(
        'ca_user không thể chuyển user sang công ty khác'
      );
    }

    // Only admin can update email
    if (dto.email) {
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật email');
    }

    return;
  }

  if (currentUser.role === 'member') {
    // Member chỉ được cập nhật chính mình
    if (currentUser.id !== existingUser.id) {
      throw new ForbiddenException(
        'Bạn chỉ có thể cập nhật thông tin của chính mình'
      );
    }

    // Member không được đổi role hoặc company_id
    if (dto.role && dto.role !== existingUser.role) {
      throw new ForbiddenException('Bạn không thể thay đổi role của mình');
    }

    if (dto.company_id && dto.company_id !== existingUser.company_id) {
      throw new ForbiddenException('Bạn không thể thay đổi công ty của mình');
    }

    // Nếu muốn chặn đổi email:
    if (dto.email) {
      throw new ForbiddenException('Bạn không thể thay đổi email của mình');
    }

    return;
  }

  throw new ForbiddenException('Bạn không có quyền cập nhật user');
}


  async findAll(page: number = 1, limit: number = 10, role?: string, company_id?: number, currentUser?: any) {
    const skip = (page - 1) * limit;
    let where = {
      deleted_at: null,
      ...(role && { role }),
      ...(company_id && { company_id }),
    };

    // Áp dụng filter theo quyền
    if (currentUser?.role === 'ca_user') {
      // ca_user chỉ xem được user trong công ty của mình
      where = {
        ...where,
        company_id: currentUser.company_id,
      };
    } else if (currentUser?.role === 'member') {
      // Member không được xem danh sách user
      throw new ForbiddenException('Bạn không có quyền xem danh sách user');
    }

    const [users, total] = await Promise.all([
        this.prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
            id: true,
            email: true,
            full_name: true,
            avatar: true,
            role: true,
            company_id: true,
            status: true,
            day_of_birth: true,
            created_at: true,
            updated_at: true,
            company: {
                select: {
                id: true,
                name: true,
                },
            },
            },
            orderBy: {
            created_at: 'desc',
            },
        }),
        this.prisma.user.count({ where }),
        ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

    async findOne(id: number, currentUser?: any) {
    const user = await this.prisma.user.findUnique({
        where: { id , deleted_at: null},
        select: {
        id: true,
        email: true,
        full_name: true,
        avatar: true,
        role: true,
        company_id: true,
        status: true,
        day_of_birth: true,
        created_at: true,
        updated_at: true,
        deleted_at:true,
        company: {
            select: {
            id: true,
            name: true,
            address: true,
            },
        },
        },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra quyền xem user
    if (currentUser?.role === 'ca_user') {
      if (user.company_id !== currentUser.company_id) {
        throw new ForbiddenException('ca_user chỉ có thể xem user trong công ty của mình');
      }
    } else if (currentUser?.role === 'member') {
      throw new ForbiddenException('Bạn không có quyền xem thông tin user');
    }

    return user;
  }

  async remove(id: number, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra quyền xóa user
    if (currentUser.role === 'admin') {
      // Admin có thể xóa bất kỳ user nào
    } else if (currentUser.role === 'ca_user') {
      // ca_user chỉ có thể xóa user trong công ty của mình
      if (user.company_id !== currentUser.company_id) {
        throw new ForbiddenException('ca_user chỉ có thể xóa user trong công ty của mình');
      }
    } else {
      // Member không có quyền xóa user
      throw new ForbiddenException('Bạn không có quyền xóa user');
    }

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      }
    });
  }

  // Chức năng gán member thành company_account - chỉ admin mới được dùng
  async assignCaUsers(dto: AssignCaUserDto, currentUser: any) {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có thể gán ca_user');
    }

    // Kiểm tra company tồn tại
    const company = await this.prisma.company.findUnique({
      where: { id: dto.company_id }
    });

    if (!company) {
      throw new BadRequestException('Company không tồn tại');
    }

    // Kiểm tra tất cả users có tồn tại và là member không
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: dto.user_ids },
        deleted_at: null,
      }
    });

    if (users.length !== dto.user_ids.length) {
      throw new BadRequestException('Một hoặc nhiều user không tồn tại');
    }

    // Kiểm tra tất cả users phải là member
    const nonMembers = users.filter(user => user.role !== 'member');
    if (nonMembers.length > 0) {
      throw new BadRequestException('Chỉ có thể gán member thành ca_user');
    }

    // Cập nhật role và company_id cho các users
    const updatedUsers = await this.prisma.user.updateMany({
      where: {
        id: { in: dto.user_ids }
      },
      data: {
        role: 'ca_user',
        company_id: dto.company_id,
        updated_at: new Date(),
      }
    });

    // Gửi email thông báo cho các users được gán
    for (const user of users) {
      await sendEmail(
        user.email,
        'Chúc mừng! Bạn đã được gán làm CA User',
        `Xin chào ${user.full_name || user.email},\n\nBạn đã được gán làm CA User cho công ty ${company.name}.\n\nBây giờ bạn có thể quản lý các user trong công ty của mình.\n\nTrân trọng!`
      );
    }

    return {
      message: `Đã gán thành công ${updatedUsers.count} user(s) làm ca_user cho công ty ${company.name}`,
      updated_count: updatedUsers.count,
    };
  }

  // Get users with birthdays today for cron job
  
  async getUsersWithBirthdayToday() {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 0-indexed
    const todayDate = today.getDate();
    

    const users = await this.prisma.user.findMany({
        where: {
        day_of_birth: { not: null },
        deleted_at: null,
        status: 'active',
        },
        select: {
        id: true,
        email: true,
        full_name: true,
        day_of_birth: true, // Cần để so sánh
        }
    });

    return users.filter((user) => {
        const dob = user.day_of_birth ? new Date(user.day_of_birth) : null;
        return dob?.getDate() === todayDate && (dob.getMonth() + 1) === todayMonth;
        });

    }

  async getRanking(dto: GetRankingDto, currentUser: any) {
  const { period = 'total', limit = 10, page = 1, company_id } = dto;
  const skip = (page - 1) * limit;

  // Determine which column to use for ranking based on period
  let pointsColumn: string;
  switch (period) {
    case 'weekly':
      pointsColumn = 'weekly_points';
      break;
    case 'monthly':
      pointsColumn = 'monthly_points';
      break;
    case 'yearly':
      pointsColumn = 'yearly_points';
      break;
    default:
      pointsColumn = 'total_points';
  }

  // Build where conditions
  let whereConditions: string[] = [];
  let whereValues: (string | number)[] = [];
  let paramIndex = 1;

  // Apply company filter
  if (company_id) {
    const company = await this.prisma.company.findUnique({
      where: { id: company_id }
    });

    if (!company) {
      throw new BadRequestException('Company không tồn tại');
    }

    whereConditions.push(`ups.company_name = $${paramIndex}`);
    whereValues.push(company.name);
    paramIndex++;
  }

  // Apply restriction for ca_user (not for member)
  if (currentUser?.role === 'ca_user') {
    const userCompany = await this.prisma.company.findUnique({
      where: { id: currentUser.company_id }
    });

    if (userCompany) {
      whereConditions.push(`ups.company_name = $${paramIndex}`);
      whereValues.push(userCompany.name);
      paramIndex++;
    }
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  const rankingQuery = `
    SELECT 
      ups.user_id,
      ups.full_name,
      ups.email,
      ups.company_name,
      ups.${pointsColumn} as points,
      ROW_NUMBER() OVER (ORDER BY ups.${pointsColumn} DESC, ups.user_id ASC) as rank
    FROM public.user_points_summary ups
    ${whereClause}
    ORDER BY ups.${pointsColumn} DESC, ups.user_id ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  whereValues.push(limit, skip);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM public.user_points_summary ups
    ${whereClause}
  `;

  const countValues = whereValues.slice(0, -2);

  try {
    const [rankingData, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(rankingQuery, ...whereValues) as Promise<any[]>,
      this.prisma.$queryRawUnsafe(countQuery, ...countValues) as Promise<{ total: number | string | bigint }[]>,
    ]);

    const total = Number(countResult[0]?.total || 0);

    const formattedData = rankingData.map((user: any) => ({
      ...user,
      points: Number(user.points),
      rank: Number(user.rank)
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      period,
      company_id: company_id || null
    };
  } catch (error) {
    console.error('Error getting ranking:', error);
    throw new BadRequestException('Lỗi khi lấy bảng xếp hạng');
  }
}


// Get user's current rank and position
async getUserRank(userId: number, period: 'total' | 'weekly' | 'monthly' | 'yearly' = 'total', currentUser: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId, deleted_at: null },
    include: { company: true }
  });

  if (!user) {
    throw new NotFoundException('User không tồn tại');
  }

  // Check permissions
  if (currentUser?.role === 'ca_user') {
    if (user.company_id !== currentUser.company_id) {
      throw new ForbiddenException('ca_user chỉ có thể xem rank của user trong công ty của mình');
    }
  }
  // ❌ Loại bỏ đoạn chặn member ở đây

  let pointsColumn: string;
  switch (period) {
    case 'weekly':
      pointsColumn = 'weekly_points';
      break;
    case 'monthly':
      pointsColumn = 'monthly_points';
      break;
    case 'yearly':
      pointsColumn = 'yearly_points';
      break;
    default:
      pointsColumn = 'total_points';
  }

  const rankQuery = `
    WITH ranked_users AS (
      SELECT 
        user_id,
        full_name,
        email,
        company_name,
        ${pointsColumn} as points,
        ROW_NUMBER() OVER (ORDER BY ${pointsColumn} DESC, user_id ASC) as rank
      FROM public.user_points_summary
      ${currentUser?.role === 'ca_user' ? 'WHERE company_name = $2' : ''}
    )
    SELECT * FROM ranked_users WHERE user_id = $1
  `;

  const queryParams: (string | number)[] = [userId];

  if (currentUser?.role === 'ca_user' && user.company) {
    queryParams.push(user.company.name);
  }

  try {
    const result = await this.prisma.$queryRawUnsafe<any[]>(rankQuery, ...queryParams);

    if (!result || result.length === 0) {
      return {
        user_id: userId,
        full_name: user.full_name,
        email: user.email,
        company_name: user.company?.name || null,
        points: 0,
        rank: null,
        period
      };
    }

    const userRank = result[0];

    return {
      user_id: userRank.user_id,
      full_name: userRank.full_name,
      email: userRank.email,
      company_name: userRank.company_name,
      points: Number(userRank.points),
      rank: Number(userRank.rank),
      period
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw new BadRequestException('Lỗi khi lấy thứ hạng của user');
  }
}

async updateAvatar(userId: number, filename: string) {
    // Lấy thông tin user hiện tại để xóa avatar cũ
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!currentUser) {
      throw new NotFoundException('User không tồn tại');
    }

    // Xóa avatar cũ nếu tồn tại
    if (currentUser.avatar) {
      await this.deleteOldAvatarFile(currentUser.avatar);
    }

    // Tạo URL cho avatar mới - sử dụng cùng format như post images
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Cập nhật database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: { 
        id: true, 
        avatar: true, 
        full_name: true,
        email: true 
      },
    });

    return updatedUser;
  }

  private async deleteOldAvatarFile(avatarUrl: string) {
    try {
      // Parse filename from URL - handle avatar URL format
      let filename = '';
      if (avatarUrl.includes('/uploads/avatars/')) {
        filename = avatarUrl.split('/uploads/avatars/')[1];
      } else {
        console.warn('Unknown avatar URL format:', avatarUrl);
        return;
      }
      
      const filePath = join(process.cwd(), 'uploads', 'avatars', filename);
      
      // Kiểm tra file có tồn tại không trước khi xóa
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`Đã xóa avatar cũ: ${filePath}`);
      }
    } catch (error) {
      console.warn('Không thể xóa avatar cũ:', error.message);
      // Không throw error vì việc xóa file cũ không quan trọng bằng việc upload file mới
    }
  };


}