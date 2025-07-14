/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { USERS_PACKAGE_NAME } from '@microservice/types'
import { join } from 'path';

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
}

bootstrap();
