// E:\microservice\apps\notification-service\src\main.ts

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_PACKAGE_NAME } from '@microservice/types';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService();

  const grpcPort = configService.get<number>('NOTIFICATION_SERVICE_GRPC_PORT', 50055);
  const rabbitMqUser = configService.get<string>('RABBITMQ_USER', 'guest');
  const rabbitMqPassword = configService.get<string>('RABBITMQ_PASSWORD', 'guest');
  const rabbitMqHost = configService.get<string>('RABBITMQ_HOST', 'localhost');
  const rabbitMqPort = configService.get<number>('RABBITMQ_PORT', 5672);
  const rabbitMqNotificationQueue = configService.get<string>('RABBITMQ_NOTIFICATION_QUEUE', 'notification_queue');

  // KHỞI TẠO INSTANCE GRPC MICROSERVICE DUY NHẤT
  const grpcMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: NOTIFICATIONS_PACKAGE_NAME,
        protoPath: join(__dirname, 'proto/notifications.proto'),
        url: `0.0.0.0:${grpcPort}`,
      },
    },
  );

  // KHỞI TẠO INSTANCE RABBITMQ MICROSERVICE
  const rmqMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${rabbitMqUser}:${rabbitMqPassword}@${rabbitMqHost}:${rabbitMqPort}`],
        queue: rabbitMqNotificationQueue,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await Promise.all([
    grpcMicroservice.listen(),
    rmqMicroservice.listen(),
  ]);

  Logger.log(`🚀 Notification gRPC Microservice is running on port ${grpcPort}`);
  Logger.log(`🔗 Notification RabbitMQ Listener connected to queue: ${rabbitMqNotificationQueue}`);
}

bootstrap();