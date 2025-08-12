import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    console.log('🔑 JWT_SECRET found:', !!jwtSecret);
    console.log('🔑 JWT_SECRET value:', jwtSecret);
    
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is missing from environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('JWT')));
      throw new Error('JWT_SECRET is required but not found in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT Payload:', payload);
    
    // ✅ FIX: Convert user ID to number để tránh lỗi Prisma
    return {
      id: parseInt(payload.sub), // Convert string to number
      email: payload.email,
      role: payload.role,
      company_id: payload.company_id,
      full_name: payload.full_name,
      avatar: payload.avatar,
      day_of_birth: payload.day_of_birth,
    };
  }
}