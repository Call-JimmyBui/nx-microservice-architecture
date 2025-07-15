// File: E:\microservice\apps\order-service\src\orders\order.controller.ts

import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';

import {
  CreateOrderRequest,
  GetOrderByIdRequest,
  GetOrdersByUserIdRequest, 
  UpdateOrderStatusRequest,
  OrderResponse, 
  OrdersResponse,
  ORDER_SERVICE_NAME,
  OrderServiceControllerMethods,
  OrderServiceController,
} from '@microservice/types';

@Controller()
@OrderServiceControllerMethods()
export class OrderController implements OrderServiceController{
  constructor(
    @Inject(OrderService) private readonly orderService: OrderService,
  ) {}

  @GrpcMethod(ORDER_SERVICE_NAME, 'CreateOrder')
  async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {    
    
    const response = await this.orderService.createOrder(request);
    return response; 
  }

  @GrpcMethod(ORDER_SERVICE_NAME, 'GetOrderById')
  async getOrderById(request: GetOrderByIdRequest): Promise<OrderResponse> {
    return this.orderService.getOrderById(request);
  }

  @GrpcMethod(ORDER_SERVICE_NAME, 'GetOrdersByUserId')
  async getOrdersByUserId(request: GetOrdersByUserIdRequest): Promise<OrdersResponse> {
    return this.orderService.getOrdersByUserId(request);
  }

  @GrpcMethod(ORDER_SERVICE_NAME, 'UpdateOrderStatus')
  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<OrderResponse> {
    return this.orderService.updateOrderStatus(request);
  }
}