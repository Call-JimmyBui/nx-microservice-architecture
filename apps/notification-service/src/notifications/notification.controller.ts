import { Controller, Logger } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_SERVICE_NAME,
  SendEmailRequest,
  SendSmsRequest,
  SendPushNotificationRequest,
} from '@microservice/types';
import { Empty as GoogleProtobufEmpty } from '@microservice/types';

@Controller()
export class NotificationController {
    
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    await this.notificationService.sendOrderConfirmation(
      data.userId,
      data.orderId,
      data.totalAmount
    );
  }

  @EventPattern('payment_successful')
  async handlePaymentSuccessful(@Payload() data: any) {
    await this.notificationService.sendPaymentConfirmation(
      data.userId,
      data.orderId,
      data.amount,
      data.paymentId
    );
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendEmail')
  async sendEmail(request: SendEmailRequest): Promise<GoogleProtobufEmpty> {
    await this.notificationService.sendEmail(request);
    return {};
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendSMS')
  async sendSms(request: SendSmsRequest): Promise<GoogleProtobufEmpty> {
    await this.notificationService.sendSms(request);
    return {};
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendPushNotification')
  async sendPushNotification(request: SendPushNotificationRequest): Promise<GoogleProtobufEmpty> {
    await this.notificationService.sendPushNotification(request);
    return {};
  }
}