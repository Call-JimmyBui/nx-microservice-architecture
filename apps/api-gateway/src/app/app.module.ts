import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CART_SERVICE_NAME, CARTS_PACKAGE_NAME, CATEGORY_SERVICE_NAME, NOTIFICATION_SERVICE_NAME, NOTIFICATIONS_PACKAGE_NAME, ORDER_SERVICE_NAME, ORDERS_PACKAGE_NAME, PAYMENT_SERVICE_NAME, PAYMENTS_PACKAGE_NAME, PRODUCT_SERVICE_NAME, PRODUCTS_PACKAGE_NAME, USER_SERVICE_NAME, USERS_PACKAGE_NAME } from 'types/proto';
import { UserController } from '../user/user.controller';
import { ProductController } from '../products/products.controller';
import { OrderController } from '../orders/orders.controller';
import { CategoryController } from '../category/category.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.registerAsync([
      {
        name: PRODUCT_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: PRODUCTS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/products.proto'),
            url: `localhost:${config.get('PRODUCT_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
      {
        name: CATEGORY_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: PRODUCTS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/products.proto'),
            url: `localhost:${config.get('PRODUCT_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
      {
        name: USER_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: USERS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/users.proto'),
            url: `localhost:${config.get('USER_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
      {
        name: ORDER_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ORDERS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/orders.proto'),
            url: `localhost:${config.get('ORDER_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
      {
        name: PAYMENT_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: PAYMENTS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/payments.proto'),
            url: `localhost:${config.get('PAYMENT_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
      {
        name: NOTIFICATION_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: NOTIFICATIONS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/notifications.proto'),
            url: `localhost:${config.get('NOTIFICATION_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
      {
        name: CART_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: CARTS_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto/carts.proto'),
            url: `localhost:${config.get('CART_SERVICE_GRPC_PORT')}`,
          },
        }),
      },
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
