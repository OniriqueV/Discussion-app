import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global validation with transform
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ⚠️ Bắt buộc để @Type và mặc định hoạt động
      whitelist: true, // Loại bỏ field không có trong DTO
      forbidNonWhitelisted: true, // Lỗi nếu query/body chứa field lạ
    })
  );

  // ✅ Bật CORS để FE gọi được API
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
