import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Bật CORS để FE gọi được API
  app.enableCors({
    origin: 'http://localhost:3000', // URL frontend Next.js
    credentials: true, // Cho phép gửi cookie, header Authorization nếu có
  });

  await app.listen(3001); // Port của backend
}
bootstrap();
