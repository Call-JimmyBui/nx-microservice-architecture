// src/app/app.module.ts (AppModule của API Gateway)

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, ClientsProviderAsyncOptions } from '@nestjs/microservices';
import { join } from 'path';
import {
  CART_SERVICE_NAME, CARTS_PACKAGE_NAME, CATEGORY_SERVICE_NAME,
  NOTIFICATION_SERVICE_NAME, NOTIFICATIONS_PACKAGE_NAME,
  ORDER_SERVICE_NAME, ORDERS_PACKAGE_NAME, PAYMENT_SERVICE_NAME, PAYMENTS_PACKAGE_NAME,
  PRODUCT_SERVICE_NAME, PRODUCTS_PACKAGE_NAME, USER_SERVICE_NAME, USERS_PACKAGE_NAME
} from 'types/proto';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from '../user/user.controller';
import { ProductController } from '../products/products.controller';
import { OrderController } from '../orders/orders.controller';
import { CategoryController } from '../category/category.controller';

function createGrpcClientConfig(
  serviceNameCamelCase: string, 
  serviceNameConstant: string,
  packageName: string,
  protoFileName: string,
): ClientsProviderAsyncOptions {
  return {
    name: serviceNameConstant,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const isLocal = config.get('NODE_ENV') === 'development' || config.get('NODE_ENV') === 'local';

      // Chuyển đổi serviceNameCamelCase sang dạng UPPER_SNAKE_CASE để khớp với biến môi trường
      const envPrefix = serviceNameCamelCase.replace(/([A-Z])/g, '_$1').toUpperCase();

      const hostLocal = config.get(`${envPrefix}_GRPC_HOST_LOCAL`);
      const hostK8s = config.get(`${envPrefix}_GRPC_HOST_K8S`);
      const port = config.get(`${envPrefix}_GRPC_PORT`);
      const namespaceK8s = config.get(`${envPrefix}_NAMESPACE_K8S`);

      // Xây dựng URL dựa trên môi trường
      const url = isLocal
        ? `${hostLocal}:${port}`
        : `${hostK8s}.${namespaceK8s}.svc.cluster.local:${port}`;

      console.log(`[API Gateway] ${serviceNameCamelCase.toUpperCase()}_GRPC_URL: ${url}`);

      return {
        transport: Transport.GRPC,
        options: {
          package: packageName,
          protoPath: join(__dirname, `proto/${protoFileName}`),
          url: url,
        },
      };
    },
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.registerAsync([

      createGrpcClientConfig(
        'productService', 
        PRODUCT_SERVICE_NAME,
        PRODUCTS_PACKAGE_NAME,
        'products.proto'
      ),
      {
        name: CATEGORY_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const isLocal = config.get('NODE_ENV') === 'development' || config.get('NODE_ENV') === 'local';
          const host = isLocal
            ? config.get('PRODUCT_SERVICE_GRPC_HOST_LOCAL')
            : config.get('PRODUCT_SERVICE_GRPC_HOST_K8S');
          const port = config.get('PRODUCT_SERVICE_GRPC_PORT');
          const namespace = config.get('PRODUCT_SERVICE_NAMESPACE_K8S');

          const url = isLocal
            ? `${host}:${port}`
            : `${host}.${namespace}.svc.cluster.local:${port}`;

          console.log(`[API Gateway] CATEGORY_SERVICE_GRPC_URL (via PRODUCT_SERVICE): ${url}`);

          return {
            transport: Transport.GRPC,
            options: {
              package: PRODUCTS_PACKAGE_NAME,
              protoPath: join(__dirname, 'proto/products.proto'),
              url: url,
            },
          };
        },
      },

      createGrpcClientConfig(
        'userService',
        USER_SERVICE_NAME,
        USERS_PACKAGE_NAME,
        'users.proto'
      ),

      createGrpcClientConfig(
        'orderService',
        ORDER_SERVICE_NAME,
        ORDERS_PACKAGE_NAME,
        'orders.proto'
      ),

      createGrpcClientConfig(
        'paymentService',
        PAYMENT_SERVICE_NAME,
        PAYMENTS_PACKAGE_NAME,
        'payments.proto'
      ),

      createGrpcClientConfig(
        'notificationService',
        NOTIFICATION_SERVICE_NAME,
        NOTIFICATIONS_PACKAGE_NAME,
        'notifications.proto'
      ),

      createGrpcClientConfig(
        'cartService',
        CART_SERVICE_NAME,
        CARTS_PACKAGE_NAME,
        'carts.proto'
      ),
    ]),
  ],
  controllers: [
    AppController,
    UserController,
    ProductController,
    CategoryController,
    OrderController
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}