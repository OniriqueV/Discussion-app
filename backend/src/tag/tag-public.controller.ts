// tag-public.controller.ts - Public routes (separate file)
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { SearchTagDto } from './dto/search-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tags Public')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Only JWT guard, no roles guard
@Controller('tags') // Keep the original route for public access
export class TagPublicController {
  constructor(private tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags for public use (authenticated users)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async findAllPublic(@Query() query: SearchTagDto) {
    return {
      success: true,
      message: 'Tags retrieved successfully',
      ...await this.tagService.findAll(query)
    };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags for public use' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Popular tags retrieved successfully' })
  async getPopularPublic(@Query('limit') limit?: number) {
    return {
      success: true,
      message: 'Popular tags retrieved successfully',
      data: await this.tagService.getPopularTags(limit ? parseInt(limit.toString()) : 10)
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get tag by slug for public use' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findBySlugPublic(@Param('slug') slug: string) {
    return {
      success: true,
      message: 'Tag retrieved successfully',
      data: await this.tagService.findBySlug(slug)
    };
  }
}