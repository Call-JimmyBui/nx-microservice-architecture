import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
// Đảm bảo import đúng các types từ file generated payments.ts của bạn
import {
  ProcessPaymentRequest, 
  PaymentResponse,     
  GetPaymentStatusRequest, 
  PaymentStatusResponse,   
  PaymentServiceController, 
} from '@microservice/types'; 

import { PaymentService } from './payment.service';
import { PAYMENT_SERVICE_NAME } from 'types/proto/payments';


@Controller()
export class PaymentController implements PaymentServiceController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod(PAYMENT_SERVICE_NAME, 'ProcessPayment')
  async processPayment(request: ProcessPaymentRequest): Promise<PaymentResponse> {
    return this.paymentService.processPayment(request);
  }

  @GrpcMethod(PAYMENT_SERVICE_NAME, 'GetPaymentStatus')
  async getPaymentStatus(request: GetPaymentStatusRequest): Promise<PaymentStatusResponse> {
    return this.paymentService.getPaymentStatus(request);
  }
}