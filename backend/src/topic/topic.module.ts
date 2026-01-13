// topic.module.ts
import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TopicPublicController } from './topic-public.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TopicController, TopicPublicController], // Register both controllers
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}