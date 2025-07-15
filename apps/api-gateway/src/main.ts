/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { TimestampInterceptor } from './common/interceptors/timestamp.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Global Pipes (Validate)
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,                     // Loại bỏ các thuộc tính không có trong DTO
  //   forbidNonWhitelisted: true,          // Báo lỗi nếu có thuộc tính không được phép
  //   transform: true,                     // Tự động biến đổi payload thành instance của DTO
  // }));

  // Kích hoạt CORS (quan trọng cho frontend)
  app.enableCors();

  // Đặt tiền tố toàn cầu cho tất cả các route (ví dụ: http://localhost:3000/api/v1/products)
  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new TimestampInterceptor());

  await app.listen(4000);
  Logger.log(
    `🚀 Api-Gateway Microservices is running port 4000}`
  );
}
bootstrap();
