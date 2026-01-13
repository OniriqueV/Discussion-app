import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ Import ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './company/company.module';
import { TopicModule } from './topic/topic.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    // ✅ Thêm ConfigModule để load file .env
    ConfigModule.forRoot({
      isGlobal: true, // Làm cho ConfigService có sẵn trong toàn bộ app
      envFilePath: ['.env'], // Load file .env
    }),
    AuthModule, 
    PrismaModule, 
    CompanyModule, 
    TopicModule,
    TagModule,
    UserModule,
    SchedulerModule,
    PostsModule,
    CommentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}