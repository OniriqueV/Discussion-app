import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

 @Post('login')
    async login(@Body('id_token') idToken: string) {
    // console.log('Received ID token:', idToken); 
    return this.authService.loginWithGoogle(idToken);
    }

}
