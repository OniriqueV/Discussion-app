import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './company/company.module'; // Nếu cần dùng module này
import { TopicModule } from './topic/topic.module';
import { TagModule } from './tag/tag.module';
@Module({
  imports: [AuthModule, PrismaModule, CompanyModule, TopicModule,TagModule], // Thêm PrismaModule và CompanyModule nếu cần
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
