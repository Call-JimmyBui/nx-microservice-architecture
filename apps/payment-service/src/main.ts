/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PAYMENTS_PACKAGE_NAME } from 'types/proto';
import { join } from 'path';

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
}

bootstrap();
