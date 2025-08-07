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
    let user = await this.prisma.user.findUnique({ 
      where: { email },
      include: {
        company: true
      }
    });

    if (!user) {
      // Determine role based on email
      const role = this.isAdminEmail(email) ? 'admin' : 'member';
      
      // Get default company for admin users
      let companyId: number | null = null;

      if (role === 'admin') {
        const defaultCompany = await this.prisma.company.findFirst({
          where: { name: 'Default Company' }
        });
        companyId = defaultCompany?.id ?? null;
      }


      user = await this.prisma.user.create({
        data: {
          email,
          full_name: name,
          avatar: picture,
          password_hash: '',
          role,
          company_id: companyId,
        },
        include: {
          company: true
        }
      });
    } else {
      // Update existing user if they should be admin but aren't
      if (this.isAdminEmail(email) && user.role !== 'admin') {
        const defaultCompany = await this.prisma.company.findFirst({
          where: { name: 'Default Company' }
        });

        user = await this.prisma.user.update({
          where: { email },
          data: { 
            role: 'admin',
            company_id: defaultCompany?.id || user.company_id,
          },
          include: {
            company: true
          }
        });
      }

      // Update avatar and name if changed
      if (user.avatar !== picture || user.full_name !== name) {
        user = await this.prisma.user.update({
          where: { email },
          data: {
            avatar: picture,
            full_name: name,
          },
          include: {
            company: true
          }
        });
      }
    }

    // Create JWT token
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