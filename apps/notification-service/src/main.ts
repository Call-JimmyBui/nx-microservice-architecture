import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_PACKAGE_NAME } from '@microservice/types';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import * as promClient from 'prom-client';
import express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const configService = new ConfigService();

  const grpcPort = configService.get<number>('NOTIFICATION_SERVICE_GRPC_PORT', 50055);
  const rabbitMqUser = configService.get<string>('RABBITMQ_USER', 'guest');
  const rabbitMqPassword = configService.get<string>('RABBITMQ_PASSWORD', 'guest');
  const rabbitMqHost = configService.get<string>('RABBITMQ_HOST', 'localhost');
  const rabbitMqPort = configService.get<number>('RABBITMQ_PORT', 5672);
  const rabbitMqNotificationQueue = configService.get<string>('RABBITMQ_NOTIFICATION_QUEUE', 'notification_queue');


  const app = await NestFactory.create<NestExpressApplication>(AppModule); 

  // Đăng ký GRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: NOTIFICATIONS_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/notifications.proto'),
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  // Đăng ký RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${rabbitMqUser}:${rabbitMqPassword}@${rabbitMqHost}:${rabbitMqPort}`],
      queue: rabbitMqNotificationQueue,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();


  Logger.log(`🚀 Notification gRPC Microservice is running on port ${grpcPort}`);
  Logger.log(`🔗 Notification RabbitMQ Listener connected to queue: ${rabbitMqNotificationQueue}`);

  // Khởi tạo và lắng nghe metrics server TRÊN CỔNG RIÊNG (vẫn như cũ, và đúng)
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9095; // Sử dụng cổng riêng 9094 cho Notification Service
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

  console.log('Application bootstrap complete. Both gRPC, RabbitMQ Microservices and Metrics servers should be running.');
}

bootstrap();