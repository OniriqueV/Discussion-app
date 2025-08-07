import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ Health check endpoint - thêm mới
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // ✅ Login với Google ID Token (giữ nguyên logic cũ)
  @Post('login')
  async login(@Body('id_token') idToken: string) {
    console.log('🔍 Received ID token:', idToken ? 'Token received' : 'No token');
    return this.authService.loginWithGoogle(idToken);
  }

  // ✅ Get current user - thêm mới
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
}