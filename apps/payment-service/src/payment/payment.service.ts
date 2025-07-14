import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import {
  ProcessPaymentRequest,
  GetPaymentStatusRequest,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentProto,
  PaymentStatusProto, 
} from '@microservice/types'; 

// Nếu Payment Service cần gọi Notification Service
import { NotificationServiceClient, NOTIFICATION_SERVICE_NAME } from '@microservice/types';
import { UserServiceClient, USER_SERVICE_NAME, UserResponse } from '@microservice/types';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Timestamp } from '@microservice/types';
import { PaymentStatus } from '@microservice/common';


@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private notificationService: NotificationServiceClient;
  private userService: UserServiceClient;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE_NAME) private readonly notificationClient: ClientGrpc, 
    @Inject(USER_SERVICE_NAME) private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationService = this.notificationClient.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME);
    this.userService = this.userClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  // Hàm helper để chuyển đổi từ Payment entity sang PaymentProto
  private mapPaymentToProto(payment: Payment): PaymentProto {
    // Chuyển đổi string status sang PaymentStatusProto enum
    let statusProto: PaymentStatusProto;
    switch (payment.status.toUpperCase()) {
      case 'SUCCESS':
        statusProto = PaymentStatusProto.SUCCESS;
        break;
      case 'FAILED':
        statusProto = PaymentStatusProto.FAILED;
        break;
      case 'REFUNDED':
        statusProto = PaymentStatusProto.REFUNDED;
        break;
      default:
        statusProto = PaymentStatusProto.PENDING; // Mặc định là PENDING nếu không khớp
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: parseFloat(payment.amount.toString()), // Đảm bảo là number
      currency: payment.currency,
      status: statusProto,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId || '',
      createdAt: this.dateToTimestamp(payment.createdAt),
      updatedAt: this.dateToTimestamp(payment.updatedAt),
    };
  }

  private dateToTimestamp(date: Date): Timestamp {
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: (date.getTime() % 1000) * 1_000_000,
    };
  }

  async processPayment(request: ProcessPaymentRequest): Promise<PaymentResponse> {
    this.logger.log(`Processing payment for Order ID: ${request.orderId}, User ID: ${request.userId}`);
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    let transactionId: string = '';

    try {
      // 1. Tạo bản ghi thanh toán ban đầu (Pending)
      const newPayment = this.paymentRepository.create({
        orderId: request.orderId,
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        paymentMethod: request.paymentMethod,
        status: PaymentStatus.PENDING,
      });
      const savedPayment = await this.paymentRepository.save(newPayment);

      // 2. Gọi cổng thanh toán bên thứ ba (Stripe, PayPal, Momo...)
      // Đây là phần logic giả lập. Trong thực tế, bạn sẽ gửi yêu cầu API đến cổng thanh toán.
      const paymentGatewayResult = {
        success: true, // Giả lập thanh toán thành công
        transactionId: `txn_${Date.now()}_${savedPayment.id.substring(0, 8)}`,
        gatewayResponse: { }
      };

      if (paymentGatewayResult.success) {
        paymentStatus = PaymentStatus.SUCCESS;
        transactionId = paymentGatewayResult.transactionId;
      } else {
        paymentStatus = PaymentStatus.FAILED;
        // Có thể lưu thông tin lỗi từ gatewayResult.error
      }

      // 3. Cập nhật trạng thái thanh toán
      savedPayment.status = paymentStatus;
      savedPayment.transactionId = transactionId;
      savedPayment.gatewayResponse = JSON.stringify(paymentGatewayResult.gatewayResponse);
      const updatedPayment = await this.paymentRepository.save(savedPayment);

      this.logger.log(`Payment processed for ID: ${updatedPayment.id}, Status: ${updatedPayment.status}`);

      // 4. Gửi thông báo cho người dùng (nếu thanh toán thành công/thất bại)
      try {
        const userResponse: UserResponse = await firstValueFrom(this.userService.getUserById({ id: request.userId }));
        if (userResponse && userResponse.user.email) {
          await firstValueFrom(this.notificationService.sendEmail({
            recipientEmail: userResponse.user.email,
            subject: `Payment ${paymentStatus.toLowerCase()} for Order ${request.orderId}`,
            body: `Your payment for order ${request.orderId} (${request.amount} ${request.currency}) was ${paymentStatus.toLowerCase()}. Transaction ID: ${transactionId}.`,
          }));
        }
      } catch (notificationError) {
        this.logger.error(`Failed to send notification for payment ${updatedPayment.id}: ${notificationError.message}`);
        // Không chặn luồng chính nếu thông báo thất bại
      }

      return { payment: this.mapPaymentToProto(updatedPayment) };

    } catch (error) {
      this.logger.error(`Error processing payment for Order ID: ${request.orderId}, User ID: ${request.userId}: ${error.message}`, error.stack);
      // Nếu có lỗi, cố gắng tạo một bản ghi FAILED hoặc cập nhật bản ghi đang Pending
      const failedPayment = this.paymentRepository.create({
        orderId: request.orderId,
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        paymentMethod: request.paymentMethod,
        status: PaymentStatus.FAILED,
        gatewayResponse: JSON.stringify({ error: error.message }),
      });
      await this.paymentRepository.save(failedPayment);

      return {
        payment: this.mapPaymentToProto(failedPayment),
      };
    }
  }

  async getPaymentStatus(request: GetPaymentStatusRequest): Promise<PaymentStatusResponse> {
    this.logger.log(`Fetching payment status for ID: ${request.paymentId} or Order ID: ${request.orderId}`);
    let payment: Payment | null = null;

    if (request.paymentId) {
      payment = await this.paymentRepository.findOne({ where: { id: request.paymentId } });
    } else if (request.orderId) {
      // Nếu chỉ có orderId, lấy payment gần nhất cho order đó (hoặc đầu tiên nếu có nhiều)
      payment = await this.paymentRepository.findOne({
        where: { orderId: request.orderId },
        order: { createdAt: 'DESC' }, // Lấy cái mới nhất
      });
    }

    if (!payment) {
      this.logger.warn(`Payment not found for request: ${JSON.stringify(request)}`);
      return {
        status: PaymentStatusProto.UNRECOGNIZED, // Hoặc một enum khác như NOT_FOUND
        message: 'Payment not found.',
      };
    }

    const paymentProto = this.mapPaymentToProto(payment);
    return {
      status: paymentProto.status,
      message: `Payment status: ${payment.status}`,
      payment: paymentProto,
    };
  }
}