import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@microservice/database'
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../notifications/notification.module';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot({
      entities: [Notification],
      databaseNameEnvKey: 'NOTIFICATION_DB_DATABASE', 
    }),
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
