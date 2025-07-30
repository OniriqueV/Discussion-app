import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { multerCompanyLogoConfig } from 'src/common/config/multer-config';

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: CompanyResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companyService.create(createCompanyDto);
  }

  @Get()
  @Roles('admin', 'ca_user')
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    const user = req?.user;
    return await this.companyService.findAll(+page, +limit, search, user);
  }

  @Get(':id')
  @Roles('admin', 'ca_user')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company found', type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req?: any) {
    const user = req?.user;
    return await this.companyService.findOne(id, user);
  }

  @Get(':id/stats')
  @Roles('admin', 'ca_user')
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({ status: 200, description: 'Company statistics retrieved successfully' })
  async getStats(@Param('id', ParseIntPipe) id: number, @Request() req?: any) {
    const user = req?.user;
    return await this.companyService.getCompanyStats(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'ca_user')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully', type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req?: any,
  ) {
    const user = req?.user;
    return await this.companyService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete company (soft delete)' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete company with active users' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.companyService.remove(id);
  }

  @Post(':id/upload-logo')
  @Roles('admin', 'ca_user')
  @UseInterceptors(FileInterceptor('logo', multerCompanyLogoConfig))
  @ApiConsumes('multipart/form-data')
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req?: any,
  ) {
    if (!file) {
        throw new BadRequestException('No file uploaded');
    }

    const user = req?.user;
    const logoUrl = `/uploads/company-logos/${file.filename}`;
    return await this.companyService.uploadLogo(id, logoUrl, user);
  }
}