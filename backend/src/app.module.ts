import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './company/company.module'; // Nếu cần dùng module này
@Module({
  imports: [AuthModule, PrismaModule, CompanyModule], // Thêm PrismaModule và CompanyModule nếu cần
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
