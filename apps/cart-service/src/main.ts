/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { CARTS_PACKAGE_NAME } from '@microservice/types';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

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
}

bootstrap();
