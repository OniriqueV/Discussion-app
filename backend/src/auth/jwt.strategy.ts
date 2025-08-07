import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // ✅ Import ConfigService
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) { // ✅ Inject ConfigService
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    // ✅ Debug logs
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
      secretOrKey: jwtSecret, // ✅ Sử dụng ConfigService
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT Payload:', payload);
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      company_id: payload.company_id
    };
  }
}