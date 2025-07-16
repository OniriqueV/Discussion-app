import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadMiddleware } from '../common/middleware/file-upload.middleware';

// company.module.ts
@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    //   .apply(FileUploadMiddleware)
    //   .forRoutes('companies/*/upload-logo');
  }
}
