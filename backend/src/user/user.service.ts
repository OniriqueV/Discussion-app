
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

    if (currentUser.role === 'company_account') {
      // Company account chỉ có thể tạo member trong công ty của mình
      if (dto.role !== 'member') {
        throw new ForbiddenException('Company account chỉ có thể tạo user với role member');
      }

      if (!dto.company_id || dto.company_id !== currentUser.company_id) {
        throw new ForbiddenException('Company account chỉ có thể tạo user trong công ty của mình');
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

  private async checkUpdatePermission(existingUser: any, dto: UpdateUserDto, currentUser: any) {
    if (currentUser.role === 'admin') {
      // Admin có thể cập nhật bất kỳ user nào
      return;
    }

    if (currentUser.role === 'company_account') {
      // Company account chỉ có thể cập nhật member trong công ty của mình
      if (existingUser.role !== 'member' || existingUser.company_id !== currentUser.company_id) {
        throw new ForbiddenException('Company account chỉ có thể cập nhật member trong công ty của mình');
      }

      // Company account không thể thay đổi role hoặc company_id
      if (dto.role && dto.role !== 'member') {
        throw new ForbiddenException('Company account không thể thay đổi role của user');
      }

      if (dto.company_id && dto.company_id !== currentUser.company_id) {
        throw new ForbiddenException('Company account không thể chuyển user sang công ty khác');
      }

      // Only admin can update email
      if (dto.email) {
        throw new ForbiddenException('Chỉ admin mới có thể cập nhật email');
      }
      
      return;
    }

    // Member không có quyền cập nhật user nào
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
    if (currentUser?.role === 'company_account') {
      // Company account chỉ xem được member trong công ty của mình
      where = {
        ...where,
        role: 'member',
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
    if (currentUser?.role === 'company_account') {
      if (user.role !== 'member' || user.company_id !== currentUser.company_id) {
        throw new ForbiddenException('Company account chỉ có thể xem member trong công ty của mình');
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
    } else if (currentUser.role === 'company_account') {
      // Company account chỉ có thể xóa member trong công ty của mình
      if (user.role !== 'member' || user.company_id !== currentUser.company_id) {
        throw new ForbiddenException('Company account chỉ có thể xóa member trong công ty của mình');
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
      throw new BadRequestException('Chỉ có thể gán member thành company_account');
    }

    // Cập nhật role và company_id cho các users
    const updatedUsers = await this.prisma.user.updateMany({
      where: {
        id: { in: dto.user_ids }
      },
      data: {
        role: 'company_account',
        company_id: dto.company_id,
        updated_at: new Date(),
      }
    });

    // Gửi email thông báo cho các users được gán
    for (const user of users) {
      await sendEmail(
        user.email,
        'Chúc mừng! Bạn đã được gán làm Company Account',
        `Xin chào ${user.full_name || user.email},\n\nBạn đã được gán làm Company Account cho công ty ${company.name}.\n\nBây giờ bạn có thể quản lý các member trong công ty của mình.\n\nTrân trọng!`
      );
    }

    return {
      message: `Đã gán thành công ${updatedUsers.count} user(s) làm company_account cho công ty ${company.name}`,
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
}