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

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          full_name: name,
          avatar: picture,
          password_hash: '',
        },
      });
    }

    // 👉 Tạo JWT
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
      user,
      token,
    };
  }
}
