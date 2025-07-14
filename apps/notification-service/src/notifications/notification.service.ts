import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';

import {
  USER_SERVICE_NAME,
  UserServiceClient,
  UserResponse,
  SendEmailRequest,
  SendSmsRequest,
  SendPushNotificationRequest,
} from '@microservice/types';

import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { ConfigService } from '@nestjs/config';
import { RABBITMQ_SERVICE } from '@microservice/common';



@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private userService: UserServiceClient;
  private transporter: Mail;

  constructor(
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmqClient: ClientProxy,
    @Inject(USER_SERVICE_NAME) private readonly userClientProxy: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.userService = this.userClientProxy.getService<UserServiceClient>(USER_SERVICE_NAME);

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_SERVICE_HOST'),
      port: this.configService.get<number>('EMAIL_SERVICE_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SERVICE_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_SERVICE_USER'),
        pass: this.configService.get<string>('EMAIL_SERVICE_PASS'),
      },
      requireTLS: true,
    });

    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter connection failed:', error.message);
      } else {
        this.logger.log('Email transporter is ready to send messages.');
      }
    });
  }

  async sendOrderConfirmation(userId: string, orderId: string, amount: number): Promise<void> {

    let userResponse: UserResponse | undefined;
    let recipientEmail: string | undefined;
    let userName: string | undefined;

    try {
      userResponse = await lastValueFrom(
        this.userService.getUserById({ id: userId })
      );

      if (!userResponse || !userResponse.user || !userResponse.user.email) {
        return;
      }

      recipientEmail = userResponse.user.email;
      userName = userResponse.user.lastName || userResponse.user.firstName || 'bạn';

      const emailSubject = `Xác nhận đơn hàng #${orderId}`;
      const emailBodyHtml = `Chào ${userName},<br><br>Đơn hàng của bạn với tổng số tiền ${amount} đã được xác nhận thành công.<br>Mã đơn hàng: ${orderId}.<br><br>Cảm ơn bạn đã mua sắm!`;

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
        to: recipientEmail,
        subject: emailSubject,
        html: emailBodyHtml,
      });

    } catch (error) {
      console.log('vãi cả lồn');
      
    }
  }

  async sendPaymentConfirmation(userId: string, orderId: string, amount: number, paymentId: string): Promise<void> {
    this.logger.log(`Initiating payment confirmation for User ${userId}, Order ${orderId}, Amount ${amount}, Payment ID ${paymentId}`);

    let userResponse: UserResponse | undefined;
    let recipientEmail: string | undefined;
    let userName: string | undefined;

    try {
      this.logger.log(`Requesting user details for ID: ${userId} from UserService.`);
      userResponse = await lastValueFrom(
        this.userService.getUserById({ id: userId })
      );

      if (!userResponse || !userResponse.user || !userResponse.user.email) {
        this.logger.warn(`Could not retrieve email for user ID: ${userId}. Skipping payment confirmation email.`);
        return;
      }

      recipientEmail = userResponse.user.email;
      userName = userResponse.user.lastName || userResponse.user.firstName || 'bạn';
      this.logger.log(`Retrieved user email: ${recipientEmail} for user ID: ${userId}.`);

      const emailSubject = `Thanh toán đơn hàng #${orderId} thành công!`;
      const emailBodyHtml = `Chào ${userName},<br><br>Giao dịch thanh toán của bạn cho đơn hàng #${orderId} với tổng số tiền **${amount}** đã thành công.<br>Mã giao dịch: ${paymentId}.<br><br>Cảm ơn bạn đã mua sắm!`;

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
        to: recipientEmail,
        subject: emailSubject,
        html: emailBodyHtml,
      });

      this.logger.log(`Payment confirmation email sent to ${recipientEmail} for Order ID: ${orderId}`);

    } catch (error) {
      this.logger.error(`Error sending payment confirmation for Order ID: ${orderId}: ${error.message}`, error.stack);
    }
  }

  async sendEmail(request: SendEmailRequest): Promise<void> {
    this.logger.log(`Sending email to: ${request.recipientEmail} with subject: ${request.subject}`);
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
        to: request.recipientEmail,
        subject: request.subject,
        html: request.body,
      });
      this.logger.log(`Email sent successfully to ${request.recipientEmail}.`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${request.recipientEmail}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendSms(request: SendSmsRequest): Promise<void> {
    this.logger.log(`Sending SMS to: ${request.recipientPhoneNumber} with message: ${request.message}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.logger.log(`SMS sent successfully to ${request.recipientPhoneNumber}.`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${request.recipientPhoneNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendPushNotification(request: SendPushNotificationRequest): Promise<void> {
    this.logger.log(`Received Push Notification request for userId: ${request.userId} with title: ${request.title}`);

    let deviceToken: string | undefined;
    try {
      const userResponse: UserResponse = await firstValueFrom(this.userService.getUserById({ id: request.userId }));
      if (userResponse && userResponse.user && userResponse.user.deviceToken) {
        deviceToken = userResponse.user.deviceToken;
        this.logger.log(`Found device token for user ${request.userId}: ${deviceToken}`);
      } else {
        this.logger.warn(`No device token found for user: ${request.userId}. Push notification skipped.`);
        return;
      }
    } catch (error) {
      this.logger.error(`Error fetching device token for user ${request.userId}: ${error.message}`);
      throw error;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.logger.log(`Push Notification sent to device: ${deviceToken} (User: ${request.userId}). Title: ${request.title}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${request.userId} (device: ${deviceToken}): ${error.message}`, error.stack);
      throw error;
    }
  }
}