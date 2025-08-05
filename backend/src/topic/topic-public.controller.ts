// topic-public.controller.ts - Public routes (separate file)
import {
  Controller,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Topics Public')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Only JWT guard, no roles guard
@Controller('topics') // Keep the original route for public access
export class TopicPublicController {
  constructor(private topicService: TopicService) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics for public use (authenticated users)' })
  @ApiResponse({ status: 200, description: 'Topics retrieved successfully' })
  async findAllPublic() {
    return {
      success: true,
      message: 'Topics retrieved successfully',
      data: await this.topicService.findAll()
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get topic by slug for public use' })
  @ApiResponse({ status: 200, description: 'Topic retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findBySlugPublic(@Param('slug') slug: string) {
    return {
      success: true,
      message: 'Topic retrieved successfully',
      data: await this.topicService.findBySlug(slug)
    };
  }
}