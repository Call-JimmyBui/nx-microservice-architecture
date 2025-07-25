import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { join } from 'path';
import { USER_SERVICE_NAME, UsersProtobufPackage } from '@microservice/types';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RABBITMQ_SERVICE } from '@microservice/common';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_SERVICE_HOST'),
          port: configService.get<number>('EMAIL_SERVICE_PORT'),
          secure: configService.get<string>('EMAIL_SERVICE_SECURE') === 'true',
          auth: {
            user: configService.get<string>('EMAIL_SERVICE_USER'),
            pass: configService.get<string>('EMAIL_SERVICE_PASS'),
          },
          tls: {},
        },
        defaults: {
          from: `"${configService.get<string>('EMAIL_FROM_NAME', 'Your App')}" <${configService.get<string>('EMAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),

    ClientsModule.registerAsync([
      {
        name: USER_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: UsersProtobufPackage,
            protoPath: join(__dirname, 'proto/users.proto'),
            url: `localhost:${configService.get<number>('USER_SERVICE_GRPC_PORT', 50052)}`,
          },
        }),
        inject: [ConfigService],
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
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}