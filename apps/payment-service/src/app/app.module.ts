import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@microservice/database';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot({
      entities: [Payment],
      databaseNameEnvKey: process.env.PAYMENT_DB_DATABASE, 
    }),
    PaymentModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}