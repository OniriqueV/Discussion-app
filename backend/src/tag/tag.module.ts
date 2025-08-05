// tag.module.ts
import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TagPublicController } from './tag-public.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TagController, TagPublicController], // Register both controllers
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}