// E:\microservice\apps\payment-service\src\payments\payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';

import { GrpcClientUtilityModule } from '@microservice/grpc-client-utility'; 

import {
  USER_SERVICE_NAME,
  UsersProtobufPackage,
} from '@microservice/types';

import {
  NOTIFICATION_SERVICE_NAME,
  NotificationsProtobufPackage,
} from '@microservice/types';


@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),

    GrpcClientUtilityModule.registerClients([
      {
        name: NOTIFICATION_SERVICE_NAME,
        protobufPackage: NotificationsProtobufPackage,
        protoFileName: 'proto/notifications.proto',
        envPortKey: 'NOTIFICATION_SERVICE_GRPC_PORT',
      },
      {
        name: USER_SERVICE_NAME,
        protobufPackage: UsersProtobufPackage,
        protoFileName: 'proto/users.proto', 
        envPortKey: 'USER_SERVICE_GRPC_PORT',
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule {}