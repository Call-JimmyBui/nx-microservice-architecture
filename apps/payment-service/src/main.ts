import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PAYMENTS_PACKAGE_NAME } from 'types/proto';
import { join } from 'path';
import * as promClient from 'prom-client';
import express from 'express';

async function bootstrap() {
 const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PAYMENTS_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/payments.proto'),
      url: `0.0.0.0:${process.env.PAYMENT_SERVICE_GRPC_PORT || 50054}`,
    }
  });

  await app.listen();
  Logger.log(
    `🚀 PAYMENT_SERVICE microservice is running on ${process.env.PAYMENT_SERVICE_GRPC_PORT || 50054}`
  );

    // 2. Khởi tạo và lắng nghe metrics server TRÊN CỔNG RIÊNG
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9094; // Sử dụng cổng riêng 9094
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
