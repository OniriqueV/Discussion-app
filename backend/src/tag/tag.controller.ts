import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { BulkDeleteTagDto } from './dto/bulk-delete.dto';
import { SearchTagDto } from './dto/search-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  async create(@Body() dto: CreateTagDto) {
    return {
      success: true,
      message: 'Tag created successfully',
      data: await this.tagService.create(dto)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags with pagination and search' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async findAll(@Query() query: SearchTagDto) {
    return {
      success: true,
      message: 'Tags retrieved successfully',
      ...await this.tagService.findAll(query)
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tag statistics' })
  @ApiResponse({ status: 200, description: 'Tag stats retrieved successfully' })
  async getStats() {
    return {
      success: true,
      message: 'Tag statistics retrieved successfully',
      data: await this.tagService.getTagStats()
    };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Popular tags retrieved successfully' })
  async getPopular(@Query('limit') limit?: number) {
    return {
      success: true,
      message: 'Popular tags retrieved successfully',
      data: await this.tagService.getPopularTags(limit ? parseInt(limit.toString()) : 10)
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findBySlug(@Param('slug') slug: string) {
    return {
      success: true,
      message: 'Tag retrieved successfully',
      data: await this.tagService.findBySlug(slug)
    };
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update tag by slug' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 409, description: 'Tag name already exists' })
  async update(@Param('slug') slug: string, @Body() dto: UpdateTagDto) {
    return {
      success: true,
      message: 'Tag updated successfully',
      data: await this.tagService.update(slug, dto)
    };
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete tag by slug' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async softDelete(@Param('slug') slug: string) {
    await this.tagService.softDelete(slug);
    return {
      success: true,
      message: 'Tag deleted successfully'
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete tags by slugs' })
  @ApiResponse({ status: 200, description: 'Tags deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkDelete(@Body() dto: BulkDeleteTagDto) {
    const result = await this.tagService.softDeleteMany(dto);
    return {
      success: true,
      message: 'Tags deleted successfully',
      data: result
    };
  }
}
