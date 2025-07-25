/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { PRODUCTS_PACKAGE_NAME } from '@microservice/types';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PRODUCTS_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/products.proto'),
      url: `127.1.27.1:${process.env.PRODUCT_SERVICE_GRPC_PORT || 50051}`,
    }
  });

  await app.listen();
  Logger.log(
    `🚀 ${process.env.PRODUCT_SERVICE_GRPC_PORT} microservice is running on ${process.env.PRODUCT_SERVICE_GRPC_PORT || 50051}`
  );
}

bootstrap();
