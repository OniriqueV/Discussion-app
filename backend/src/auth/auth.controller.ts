import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ Health check endpoint
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // ✅ Login với Google ID Token (giữ nguyên)
  @Post('login')
  async login(@Body('id_token') idToken: string) {
    console.log('🔍 Received ID token:', idToken ? 'Token received' : 'No token');
    return this.authService.loginWithGoogle(idToken);
  }

  // ✅ NEW: Login với email/password
  @Post('login/email')
  async loginWithEmail(@Body() loginDto: LoginDto) {
    console.log('🔍 Email login attempt:', loginDto.email);
    return this.authService.loginWithEmail(loginDto);
  }

  // // ✅ NEW: Request password reset
  // @Post('password/reset-request')
  // async requestPasswordReset(@Body() dto: RequestResetPasswordDto) {
  //   return this.authService.requestPasswordReset(dto.email);
  // }

  // // ✅ NEW: Reset password with token
  // @Post('password/reset')
  // async resetPassword(@Body() dto: ResetPasswordDto) {
  //   return this.authService.resetPassword(dto);
  // }

  // // ✅ NEW: Verify reset token (optional - for frontend validation)
  // @Post('password/verify-token')
  // async verifyResetToken(@Body('token') token: string) {
  //   return this.authService.verifyResetToken(token);
  // }



  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const userId = (req as any).user.id; // hoặc req.user.id nếu đã type
    return this.authService.changePassword(userId, dto);
  }


  // ✅ Get current user
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
}