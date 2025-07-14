import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES } from '../constant';
import { DatabaseModule } from '@microservice/database'
import { ConfigModule } from '@nestjs/config';
import { Order } from '../orders/entities.ts/order.entity';
import { OrderModule } from '../orders/order.module';
import { OrderItem } from '../orders/entities.ts/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot({
      entities: [Order, OrderItem],
      databaseNameEnvKey: 'ORDER_DB_DATABASE', 
    }),
    ClientsModule.register([
      {
        name: MICROSERVICES.PRODUCT_REDIS_CLIENT,
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379
        }
      },
    ]),
    OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
