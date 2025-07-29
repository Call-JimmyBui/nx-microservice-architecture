import { ORDERS_PACKAGE_NAME } from '@microservice/types';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';
import * as promClient from 'prom-client';
import express from 'express';

async function bootstrap() {
  // 1. Khởi tạo và lắng nghe microservice gRPC
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ORDERS_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/orders.proto'),
      url: `0.0.0.0:${process.env.ORDER_SERVICE_GRPC_PORT || 50053}`,
    }
  });

  // Chờ cho gRPC microservice lắng nghe thành công
  await app.listen();
  Logger.log(
    `🚀 ${process.env.ORDER_SERVICE_GRPC_PORT} microservice is running on ${process.env.ORDER_SERVICE_GRPC_PORT || 50053}`
  );

  // 2. Khởi tạo và lắng nghe metrics server TRÊN CỔNG RIÊNG
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9093; // Sử dụng cổng riêng 9093
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