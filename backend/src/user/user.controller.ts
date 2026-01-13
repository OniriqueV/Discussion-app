// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignCaUserDto } from './dto/assign-ca-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { GetRankingDto } from './dto/get-ranking.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

@UseGuards(JwtAuthGuard)
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'avatars');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 
      },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw new ForbiddenException('Không có quyền upload avatar cho user này');
    }

    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.userService.updateAvatar(id, file.filename);
    
    return {
      message: 'Avatar uploaded successfully',
      avatar_url: result.avatar,
      user: result
    };
  }

  @Roles('admin', 'ca_user')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) dto: CreateUserDto,
    @Req() req
  ) {
    return this.userService.create(dto, req.user);
  }

  // ✅ ĐẶT TẤT CẢ ROUTES CỐ ĐỊNH TRƯỚC ROUTES DYNAMIC (:id)
  
  // Endpoint mới để admin gán member thành ca_user
  @Roles('admin')
  @Post('assign-ca-users')
  @HttpCode(HttpStatus.OK)
  assignCaUsers(
    @Body(ValidationPipe) dto: AssignCaUserDto,
    @Req() req
  ) {
    return this.userService.assignCaUsers(dto, req.user);
  }

  // ✅ RANKING ROUTES - ĐẶT TRƯỚC :id
  @Roles('admin', 'ca_user', 'member')
  @Get('ranking')
  getRanking(
    @Query(new ValidationPipe({ transform: true })) dto: GetRankingDto,
    @Req() req
  ) {
    return this.userService.getRanking(dto, req.user);
  }

  @Roles('admin', 'ca_user', 'member')
  @Get('ranking/:userId')
  getUserRank(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
    @Query('period') period: 'total' | 'weekly' | 'monthly' | 'yearly' = 'total'
  ) {
    return this.userService.getUserRank(userId, period, req.user);
  }

  // Get current user's rank (convenience endpoint)
  @Roles('admin', 'ca_user', 'member')
  @Get('my-rank')
  getMyRank(
    @Req() req: any,
    @Query('period') period: 'total' | 'weekly' | 'monthly' | 'yearly' = 'total',
  ) {
    return this.userService.getUserRank(req.user.id, period, req.user);
  }

  // ✅ GENERAL ROUTES - ĐẶT SAU CÁC ROUTES CỐ ĐỊNH
  @Roles('admin', 'ca_user','member')
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('company_id') company_id?: string,
    @Req() req?,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const companyId = company_id ? parseInt(company_id) : undefined;
    
    return this.userService.findAll(pageNum, limitNum, role, companyId, req.user);
  }

  // ✅ DYNAMIC ROUTES - ĐẶT CUỐI CÙNG
  @Roles('admin', 'ca_user')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.userService.findOne(id, req.user);
  }

  @Roles('admin', 'ca_user', 'member')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateUserDto,
    @Req() req,
  ) {
    // Chặn member update người khác
    if (req.user.role === 'member' && req.user.id !== id) {
      throw new ForbiddenException('Bạn chỉ có thể chỉnh sửa tài khoản của mình');
    }
    return this.userService.update(id, dto, req.user);
  }


  @Roles('admin', 'ca_user')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.userService.remove(id, req.user);
  }
}
