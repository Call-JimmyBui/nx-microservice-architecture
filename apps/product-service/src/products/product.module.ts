// apps/product-service/src/products/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';

import { GrpcClientUtilityModule } from '@microservice/grpc-client-utility'
import { USER_SERVICE_NAME, UsersProtobufPackage } from 'types/proto';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    GrpcClientUtilityModule.registerClients([
      {
        name: USER_SERVICE_NAME,
        protobufPackage: UsersProtobufPackage,
        protoFileName: 'proto/users.proto',
        envPortKey: 'USER_SERVICE_GRPC_PORT',
      }
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}