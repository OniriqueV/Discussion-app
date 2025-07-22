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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignCaUserDto } from './dto/assign-ca-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('admin', 'ca_user')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) dto: CreateUserDto,
    @Req() req
  ) {
    return this.userService.create(dto, req.user);
  }

  @Roles('admin', 'ca_user')
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

  @Roles('admin', 'ca_user')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.userService.findOne(id, req.user);
  }

  @Roles('admin', 'ca_user')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateUserDto,
    @Req() req,
  ) {
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
}