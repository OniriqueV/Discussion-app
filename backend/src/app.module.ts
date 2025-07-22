import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './company/company.module'; // Nếu cần dùng module này
import { TopicModule } from './topic/topic.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
@Module({
  imports: [AuthModule, PrismaModule, CompanyModule, TopicModule,TagModule,UserModule,SchedulerModule,PostsModule,CommentsModule], // Thêm PrismaModule và CompanyModule nếu cần
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
