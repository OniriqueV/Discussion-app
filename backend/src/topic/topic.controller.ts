import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('topics')
export class TopicController {
  constructor(private topicService: TopicService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'Topic created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Topic already exists' })
  async create(@Body() dto: CreateTopicDto) {
    return {
      success: true,
      message: 'Topic created successfully',
      data: await this.topicService.create(dto)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({ status: 200, description: 'Topics retrieved successfully' })
  async findAll() {
    return {
      success: true,
      message: 'Topics retrieved successfully',
      data: await this.topicService.findAll()
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get topic statistics' })
  @ApiResponse({ status: 200, description: 'Topic stats retrieved successfully' })
  async getStats() {
    return {
      success: true,
      message: 'Topic statistics retrieved successfully',
      data: await this.topicService.getTopicStats()
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get topic by slug' })
  @ApiResponse({ status: 200, description: 'Topic retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findBySlug(@Param('slug') slug: string) {
    return {
      success: true,
      message: 'Topic retrieved successfully',
      data: await this.topicService.findBySlug(slug)
    };
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update topic by slug' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  @ApiResponse({ status: 409, description: 'Topic name already exists' })
  async update(@Param('slug') slug: string, @Body() dto: UpdateTopicDto) {
    return {
      success: true,
      message: 'Topic updated successfully',
      data: await this.topicService.update(slug, dto)
    };
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete topic by slug' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async softDelete(@Param('slug') slug: string) {
    await this.topicService.softDelete(slug);
    return {
      success: true,
      message: 'Topic deleted successfully'
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete topics by slugs' })
  @ApiResponse({ status: 200, description: 'Topics deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkDelete(@Body() dto: BulkDeleteDto) {
    const result = await this.topicService.softDeleteMany(dto);
    return {
      success: true,
      message: 'Topics deleted successfully',
      data: result
    };
  }
}