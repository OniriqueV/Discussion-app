import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { multerPostImagesConfig } from '../common/config/multer-config';
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(
      createPostDto,
      req.user.id,
      req.user.company_id
    );
  }

  @Get()
  findAll(@Query() queryDto: QueryPostDto, @Request() req) {
    return this.postsService.findAll(
      queryDto,
      req.user.role,
      req.user.company_id
    );
  }

  @Get('my-posts')
  getMyPosts(@Query() queryDto: QueryPostDto, @Request() req) {
    return this.postsService.getPostsByUser(req.user.id, queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req
  ) {
    return this.postsService.update(
      id,
      updatePostDto,
      req.user.id,
      req.user.role,
      req.user.company_id
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.remove(
      id,
      req.user.id,
      req.user.role,
      req.user.company_id
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'ca_user')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Request() req
  ) {
    return this.postsService.updateStatus(id, status, req.user.id);
  }

  @Patch(':id/toggle-pin')
  @UseGuards(RolesGuard)
  @Roles('admin', 'ca_user')
  togglePin(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.togglePin(id);
  }

  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('images', 10, multerPostImagesConfig))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.postsService.uploadImages(id, files, req.user.id);
  }

  @Delete(':id/images/:imageIndex')
  async deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageIndex', ParseIntPipe) imageIndex: number,
    @Request() req
  ) {
    return this.postsService.deleteImage(id, imageIndex, req.user.id);
  }

  @Post('upload-temp-images')
  @UseInterceptors(FilesInterceptor('images', 10, multerPostImagesConfig))
  async uploadTempImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.postsService.uploadTempImages(files, req.user.id);
  }

  @Patch(':id/view')
    @HttpCode(HttpStatus.NO_CONTENT)
    async incrementView(@Param('id', ParseIntPipe) id: number) {
      await this.postsService.incrementViewCount(id);
    }

}