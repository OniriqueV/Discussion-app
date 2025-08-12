import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { sendEmail } from 'src/utils/emails';
import { ChangePasswordDto } from './dto/change-password.dto';

const client = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private readonly adminEmails = [
    'phuong.cm@zinza.com.vn',
    'vietanh203fw@gmail.com'
  ];

  private isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email.toLowerCase());
  }

  async loginWithGoogle(idToken: string) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const { email, name, picture } = payload;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        `Tài khoản ${email} chưa được cấp quyền truy cập`
      );
    }

    if (user.avatar !== picture || user.full_name !== name) {
      user = await this.prisma.user.update({
        where: { email },
        data: {
          avatar: picture,
          full_name: name,
        },
        include: {
          company: true,
        },
      });
    }

    return this.generateTokenResponse(user);
  }

  async loginWithEmail(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
        deleted_at: null
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException(
        'Tài khoản này chỉ có thể đăng nhập bằng Google'
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { updated_at: new Date() }
    });

    return this.generateTokenResponse(user);
  }

//   async requestPasswordReset(email: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { 
//         email: email.toLowerCase(),
//         deleted_at: null
//       }
//     });

//     if (!user) {
//       // Don't reveal if email exists or not for security
//       return {
//         message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu'
//       };
//     }

//     if (!user.password_hash) {
//       throw new BadRequestException('Tài khoản này chỉ có thể đăng nhập bằng Google');
//     }

//     if (user.status !== 'active') {
//       throw new BadRequestException('Tài khoản của bạn đã bị vô hiệu hóa');
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

//     // Delete any existing reset tokens for this user
//     await this.prisma.passwordReset.deleteMany({
//       where: { user_id: user.id }
//     });

//     // Create new reset token
//     await this.prisma.passwordReset.create({
//       data: {
//         user_id: user.id,
//         token: hashedToken,
//         expired_at: expiresAt,
//         created_at: new Date()
//       }
//     });

//     // Send reset email
//     const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
//     await sendEmail(
//       user.email,
//       'Đặt lại mật khẩu',
//       `Xin chào ${user.full_name || user.email},\n\nBạn đã yêu cầu đặt lại mật khẩu.\n\nVui lòng click vào link sau để đặt lại mật khẩu (có hiệu lực trong 15 phút):\n\n${resetUrl}\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nTrân trọng!`
//     );

//     return {
//       message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu'
//     };
//   }

//   // ✅ NEW: Reset password with token
//   async resetPassword(dto: ResetPasswordDto) {
//     const { token, newPassword, confirmPassword } = dto;

//     if (newPassword !== confirmPassword) {
//       throw new BadRequestException('Mật khẩu xác nhận không khớp');
//     }

//     // Hash the token to compare with database
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     // Find valid reset token
//     const passwordReset = await this.prisma.passwordReset.findFirst({
//       where: {
//         token: hashedToken,
//         expired_at: {
//           gt: new Date()
//         },
//         is_used: null
//       },
//       include: {
//         user: true
//       }
//     });

//     if (!passwordReset) {
//       throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
//     }

//     if (!passwordReset.user || passwordReset.user.deleted_at) {
//       throw new BadRequestException('Người dùng không tồn tại');
//     }

//     if (passwordReset.user.status !== 'active') {
//       throw new BadRequestException('Tài khoản đã bị vô hiệu hóa');
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     // Update user password and mark token as used
//     await Promise.all([
//       this.prisma.user.update({
//         where: { id: passwordReset.user.id },
//         data: {
//           password_hash: hashedPassword,
//           updated_at: new Date()
//         }
//       }),
//       this.prisma.passwordReset.update({
//           where: { id: passwordReset.id },
//           data: { is_used: true }
//         })

//     ]);

//     // Send confirmation email
//     await sendEmail(
//       passwordReset.user.email,
//       'Mật khẩu đã được đặt lại thành công',
//       `Xin chào ${passwordReset.user.full_name || passwordReset.user.email},\n\nMật khẩu của bạn đã được đặt lại thành công.\n\nNếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.\n\nTrân trọng!`
//     );

//     return {
//       message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.'
//     };
//   }

//   // ✅ NEW: Verify reset token
//   async verifyResetToken(token: string) {
//     console.log('Original token received:', token);
//     console.log('Token length:', token.length);
    
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
//     console.log('Hashed token:', hashedToken);

//     // Tìm tất cả password reset records để debug
//     const allResets = await this.prisma.passwordReset.findMany({
//       where: {
//         expired_at: {
//           gt: new Date()
//         },
//         is_used: null
//       }
//     });
//     console.log('All valid reset tokens in DB:', allResets);

//     const passwordReset = await this.prisma.passwordReset.findFirst({
//       where: {
//         token: hashedToken,
//         expired_at: {
//           gt: new Date()
//         },
//         is_used: null
//       },
//       include: {
//         user: {
//           select: {
//             email: true,
//             full_name: true,
//             status: true,
//             deleted_at: true
//           }
//         }
//       }
//     });

//     console.log('Found password reset:', passwordReset);

//     if (!passwordReset || !passwordReset.user || passwordReset.user.deleted_at) {
//       throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
//     }

//     if (passwordReset.user.status !== 'active') {
//       throw new BadRequestException('Tài khoản đã bị vô hiệu hóa');
//     }

//     return {
//       valid: true,
//       email: passwordReset.user.email,
//       expiresAt: passwordReset.expired_at
//     };
// }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    // Lấy thông tin user
   const user = await this.prisma.user.findFirst({
      where: { 
        id: userId,
        deleted_at: null
      }
    });


    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (!user.password_hash) {
      throw new BadRequestException('Tài khoản này chỉ có thể đăng nhập bằng Google');
    }

    if (user.status !== 'active') {
      throw new BadRequestException('Tài khoản đã bị vô hiệu hóa');
    }

    // Kiểm tra mật khẩu cũ
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Cập nhật mật khẩu
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedNewPassword,
        updated_at: new Date()
      }
    });

    // Gửi email thông báo (FIX: Template string syntax)
    await sendEmail(
      user.email,
      'Mật khẩu đã được thay đổi',
      `Xin chào ${user.full_name || user.email},

  Mật khẩu của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.

  Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản.

  Trân trọng!`
    );

    return {
      message: 'Mật khẩu đã được thay đổi thành công'
    };
  }

  // ✅ FIX: Ensure consistent token format for both login methods
  private generateTokenResponse(user: any) {
    const token = this.jwtService.sign({
      sub: user.id.toString(), // Keep as string in JWT (standard practice)
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      full_name: user.full_name,
      avatar: user.avatar,
      day_of_birth: user.day_of_birth ? user.day_of_birth.toISOString().split('T')[0] : null,
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id, // Return as number for frontend
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar,
        role: user.role,
        company_id: user.company_id,
        company: user.company,
        status: user.status,
        day_of_birth: user.day_of_birth ? user.day_of_birth.toISOString().split('T')[0] : null,
      },
      token,
    };
  }
}