import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { TimestampInterceptor } from './common/interceptors/timestamp.interceptor';
import * as promClient from 'prom-client';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Global Pipes (Validate)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Kích hoạt CORS (quan trọng cho frontend)
  app.enableCors();

  // Đặt tiền tố toàn cầu cho tất cả các route (ví dụ: http://localhost:3000/api/v1/products)
  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new TimestampInterceptor());

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Api-Gateway Microservices is running port 4000}`
  );

    // 2. Khởi tạo và lắng nghe metrics server TRÊN CỔNG RIÊNG
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9097; // Sử dụng cổng riêng 9097
  const metricsPath = '/metrics';

  promClient.collectDefaultMetrics();

  metricsApp.get(metricsPath, async (req, res) => {
    try {
      res.set('Content-Type', promClient.register.contentType);
      res.end(await promClient.register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });

  metricsApp.listen(metricsPort, () => {
    console.log(`Prometheus metrics server running on port ${metricsPort}, path ${metricsPath}`);
  });

  console.log('Application bootstrap complete. Both gRPC and Metrics servers should be running.');
}
bootstrap();
