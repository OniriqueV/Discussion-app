import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService], // Export để sử dụng ở module khác
})
export class TopicModule {}