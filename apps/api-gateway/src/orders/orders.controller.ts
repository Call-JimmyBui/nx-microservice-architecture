import { mapGrpcErrorToHttp, OrderStatus } from '@microservice/common';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Inject,
  OnModuleInit,
  HttpException, 
  HttpStatus,
  Query,  
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; 

import {
  ORDER_SERVICE_NAME,  
  ORDERS_PACKAGE_NAME, 
  OrderServiceClient,
  CreateOrderRequest,
  GetOrderByIdRequest, 
  GetOrdersByUserIdRequest, 
  UpdateOrderStatusRequest,
  OrderResponse,       
  OrdersResponse,
  OrderProto,
  OrderStatusProto,       
} from 'types/proto/orders'; 


@Controller('orders') 
export class OrderController implements OnModuleInit {
  @Inject(ORDER_SERVICE_NAME)
  private client: ClientGrpc;

  private orderService: OrderServiceClient;

  onModuleInit() {
    this.orderService = this.client.getService<OrderServiceClient>(ORDER_SERVICE_NAME);
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderRequest): Promise<OrderProto> {
    try {
        const response: OrderResponse = await firstValueFrom(this.orderService.createOrder(createOrderDto));
    return response.order;
    } catch (error) { 
        throw mapGrpcErrorToHttp(error);
    }
  }

  @Get(':id')
  async getOrderById(@Param('id') orderId: string): Promise<OrderProto> {
    const request: GetOrderByIdRequest = { id: orderId };
    const response: OrderResponse = await firstValueFrom(this.orderService.getOrderById(request));
    
    if (!response.order) {
      throw new HttpException('Order not found.', HttpStatus.NOT_FOUND);
    }
    return response.order;
  }

   @Get('user/:userId')
  async getOrdersByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,   
    @Query('limit') limit: number = 10, 
  ): Promise<OrderProto[]> {
    const request: GetOrdersByUserIdRequest = {
      userId: userId,
      page: Number(page),  
      limit: Number(limit), 
    };

    const response: OrdersResponse = await firstValueFrom(this.orderService.getOrdersByUserId(request));

    return response.orders || [];
  }


  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateStatusDto: { status: OrderStatus }, 
  ): Promise<OrderProto> {
    const request: UpdateOrderStatusRequest = { id: orderId, status: OrderStatus[OrderStatusProto[updateStatusDto.status]] };

    const response: OrderResponse = await firstValueFrom(this.orderService.updateOrderStatus(request));
    
    if (!response.order) {
      throw new HttpException('Order status update failed: No order returned.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response.order;
  }
}