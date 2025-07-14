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
    
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    console.log('nhận dc và sẽ gửi mail');
    
    try {
      await this.notificationService.sendOrderConfirmation(
        data.userId,
        data.orderId,
        data.totalAmount
      );
    } catch (error) {

    }
  }

  @EventPattern('payment_successful')
  async handlePaymentSuccessful(@Payload() data: any) {

    try {
      await this.notificationService.sendPaymentConfirmation(
        data.userId,
        data.orderId,
        data.amount,
        data.paymentId
      );
      this.logger.log(`Successfully processed 'payment_successful' for Order ID: ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process 'payment_successful' for Order ID: ${data.orderId}: ${error.message}`, error.stack);
    }
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