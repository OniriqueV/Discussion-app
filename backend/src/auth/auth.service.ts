import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

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

  // 🔍 Tìm user trong database
  let user = await this.prisma.user.findUnique({
    where: { email },
    include: {
      company: true,
    },
  });

  // ✅ Nếu không tìm thấy => báo lỗi, không tự tạo
  if (!user) {
    throw new UnauthorizedException(
      `Tài khoản ${email} chưa được cấp quyền truy cập`
    );
  }

  // (Tuỳ chọn) Cập nhật avatar, name nếu thay đổi
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

  // ✅ Tạo JWT token
  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
    full_name: user.full_name,
    avatar: user.avatar,
  });

  return {
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar: user.avatar,
      role: user.role,
      company_id: user.company_id,
      company: user.company,
      status: user.status,
    },
    token,
  };
}

}