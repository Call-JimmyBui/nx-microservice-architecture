import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { USERS_PACKAGE_NAME } from '@microservice/types'
import { join } from 'path';
import * as promClient from 'prom-client';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: USERS_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/users.proto'),
      url: `0.0.0.0:${process.env.USER_SERVICE_GRPC_PORT || 50052}`,
    }
  });

  await app.listen();
  Logger.log(
    `🚀 ${process.env.USER_SERVICE_GRPC_PORT} microservice is running on ${process.env.USER_SERVICE_GRPC_PORT || 50051}`
  );

    // 2. Khởi tạo và lắng nghe metrics server TRÊN CỔNG RIÊNG
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9092; // Sử dụng cổng riêng 9092
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
