import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { GrpcClientUtilityModule } from '@microservice/grpc-client-utility'; 
import { ClientsModule, Transport } from '@nestjs/microservices'; 
import { ConfigModule, ConfigService } from '@nestjs/config'; 

import {
  PRODUCT_SERVICE_NAME,
  ProductsProtobufPackage,
} from '@microservice/types';

import {
  USER_SERVICE_NAME,
  UsersProtobufPackage,
} from '@microservice/types';

import {
  PAYMENT_SERVICE_NAME,
  PaymentsProtobufPackage,
} from '@microservice/types';

import {
  NOTIFICATION_SERVICE_NAME,
  NotificationsProtobufPackage,
} from '@microservice/types';

import {
  RABBITMQ_SERVICE
} from '@microservice/common'

import { Order } from './entities.ts/order.entity';
import { OrderItem } from './entities.ts/order-item.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    GrpcClientUtilityModule.registerClients([
      {
        name: PRODUCT_SERVICE_NAME,
        protobufPackage: ProductsProtobufPackage,
        protoFileName: 'proto/products.proto',
        envPortKey: 'PRODUCT_SERVICE_GRPC_PORT',
      },
      {
        name: USER_SERVICE_NAME,
        protobufPackage: UsersProtobufPackage,
        protoFileName: 'proto/users.proto',
        envPortKey: 'USER_SERVICE_GRPC_PORT',
      },
      {
        name: PAYMENT_SERVICE_NAME,
        protobufPackage: PaymentsProtobufPackage,
        protoFileName: 'proto/payments.proto',
        envPortKey: 'PAYMENT_SERVICE_GRPC_PORT',
      },
      {
        name: NOTIFICATION_SERVICE_NAME,
        protobufPackage: NotificationsProtobufPackage,
        protoFileName: 'proto/notifications.proto',
        envPortKey: 'NOTIFICATION_SERVICE_GRPC_PORT',
      },
    ]),

    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICE,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASSWORD')}@${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`
            ],
            queue: configService.get<string>('RABBITMQ_ORDER_QUEUE'),
            queueOptions: {
              durable: false, 
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService, TypeOrmModule],
})
export class OrderModule {}