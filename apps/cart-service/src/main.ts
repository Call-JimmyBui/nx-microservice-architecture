import { CARTS_PACKAGE_NAME } from '@microservice/types';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';
import * as promClient from 'prom-client';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: CARTS_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/carts.proto'),
      url: `0.0.0.0:${process.env.CART_SERVICE_GRPC_PORT || 50056}`,
    }
  });

  await app.listen();
  Logger.log(
    `🚀 ${process.env.CART_SERVICE_GRPC_PORT} microservice is running on ${process.env.CART_SERVICE_GRPC_PORT || 50056}`
  );

    // 2. Khởi tạo và lắng nghe metrics server TRÊN CỔNG RIÊNG
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9096; // Sử dụng cổng riêng 9096
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
