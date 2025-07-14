// File: apps/order-service/src/orders/order.service.ts

import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';

import { Timestamp as ProtoTimestampClass } from 'google-protobuf/google/protobuf/timestamp_pb';

import {
  PRODUCT_SERVICE_NAME,
  ProductServiceClient,
  DecreaseStockRequest,  
  DecreaseStockResponse,
  ProductProto,    
  ProductsResponse, 
} from '@microservice/types';

import {
  USER_SERVICE_NAME,
  UserServiceClient,
  UserProto,  
  UserResponse,  
} from '@microservice/types';

import {
  PAYMENT_SERVICE_NAME,
  PaymentServiceClient,
  ProcessPaymentRequest, 
  PaymentResponse, 
  PaymentStatusProto,  
} from '@microservice/types';

import {
  NOTIFICATION_SERVICE_NAME,
  NotificationServiceClient,
} from '@microservice/types';

import {
  CreateOrderRequest,
  GetOrderByIdRequest,
  GetOrdersByUserIdRequest,
  UpdateOrderStatusRequest,
  OrderProto,
  OrderItemProto,
  OrderResponse,
  OrdersResponse,
  OrderStatusProto,
  Timestamp 
} from '@microservice/types'; 
import { Order } from './entities.ts/order.entity';
import { OrderItem } from './entities.ts/order-item.entity';
import { GrpcExceptionFactory, OrderStatus, RABBITMQ_SERVICE } from '@microservice/common';
import { ProductFieldKey, UserFieldKey} from '@microservice/common'
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class OrderService implements OnModuleInit {
  private productServiceClient: ProductServiceClient;
  private userServiceClient: UserServiceClient;
  private paymentServiceClient: PaymentServiceClient;
  private notificationServiceClient: NotificationServiceClient;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @Inject(PRODUCT_SERVICE_NAME) private readonly productGrpcClient: ClientGrpc, // Đổi tên biến để tránh nhầm lẫn
    @Inject(USER_SERVICE_NAME) private readonly userGrpcClient: ClientGrpc,       // Đổi tên biến
    @Inject(PAYMENT_SERVICE_NAME) private readonly paymentGrpcClient: ClientGrpc, // Đổi tên biến
    @Inject(NOTIFICATION_SERVICE_NAME) private readonly notificationGrpcClient: ClientGrpc, // Đổi tên biến
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmqClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.productServiceClient = this.productGrpcClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
    this.userServiceClient = this.userGrpcClient.getService<UserServiceClient>(USER_SERVICE_NAME);
    this.paymentServiceClient = this.paymentGrpcClient.getService<PaymentServiceClient>(PAYMENT_SERVICE_NAME);
    this.notificationServiceClient = this.notificationGrpcClient.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME);
  }


  private toTimestamp(date: Date | undefined): Timestamp | undefined {
    if (!date) return undefined;
    const protoTimestamp = new ProtoTimestampClass(); 
    protoTimestamp.fromDate(date);

    return {
      seconds: protoTimestamp.getSeconds(),
      nanos: protoTimestamp.getNanos(),
    };
  }


  private mapOrderToProto(order: Order, items?: OrderItem[]): OrderProto {
    const orderItemsProto: OrderItemProto[] = (items || order.items || []).map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      priceAtOrder: parseFloat(item.priceAtOrder.toString()),
      productDetails: undefined,
    }));

    let statusProto: OrderStatusProto;
    switch (order.status) {
        case OrderStatusProto[OrderStatusProto.PENDING]:
            statusProto = OrderStatusProto.PENDING;
            break;
        case OrderStatusProto[OrderStatusProto.PROCESSING]:
            statusProto = OrderStatusProto.PROCESSING;
            break;
        case OrderStatusProto[OrderStatusProto.SHIPPED]:
            statusProto = OrderStatusProto.SHIPPED;
            break;
        case OrderStatusProto[OrderStatusProto.DELIVERED]:
            statusProto = OrderStatusProto.DELIVERED;
            break;
        case OrderStatusProto[OrderStatusProto.CANCELLED]:
            statusProto = OrderStatusProto.CANCELLED;
            break;
        case OrderStatusProto[OrderStatusProto.PAYMENT_FAILED]:
            statusProto = OrderStatusProto.PAYMENT_FAILED;
            break;
        default:
            statusProto = OrderStatusProto.UNRECOGNIZED;
            console.warn(`[OrderService] Unknown order status '${order.status}' from DB. Mapping to UNRECOGNIZED.`);
            break;
    }
    // =================================================================

    return {
      id: order.id,
      userId: order.userId,
      items: orderItemsProto,
      totalAmount: parseFloat(order.totalAmount.toString()),
      status: statusProto, // Sử dụng statusProto đã được chuyển đổi an toàn
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: this.toTimestamp(order.createdAt),
      updatedAt: this.toTimestamp(order.updatedAt),
    };
  }


  async createOrder(createOrderRequest: CreateOrderRequest): Promise<OrderResponse> {
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rawUserResponse = await firstValueFrom(
        this.userServiceClient.getUserById({ id: createOrderRequest.userId })
      );      
console.log('sssssssssssss', rawUserResponse);

      if (!rawUserResponse || !rawUserResponse.user || !rawUserResponse.user.id) {
        throw GrpcExceptionFactory.create(UserFieldKey.USERNAME, GrpcStatus.NOT_FOUND);
      }
      const user: UserProto = rawUserResponse.user; 

      const getProductsResponse: ProductsResponse = await firstValueFrom(
        this.productServiceClient.getProductsByIds({ ids: createOrderRequest.items.map(item => item.productId) })
      );

      if (!getProductsResponse || !getProductsResponse.products || getProductsResponse.products.length !== createOrderRequest.items.length) {
        throw GrpcExceptionFactory.invalid(ProductFieldKey.PRODUCT_MISMATCH);      
      }

      const productsMap = new Map<string, ProductProto>(getProductsResponse.products.map(p => [p.id, p]));
      let totalAmount = 0;

      for (const item of createOrderRequest.items) {
        const product = productsMap.get(item.productId);
        if (!product) {
          throw GrpcExceptionFactory.notFound(ProductFieldKey.PRODUCT);      
        }
        if (product.stockQuantity === undefined || product.stockQuantity < item.quantity) {
          throw new RpcException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity || 0}, Requested: ${item.quantity}.`);
        }
        totalAmount += product.price * item.quantity;
      }

      const newOrder = this.orderRepository.create({
        userId: createOrderRequest.userId,
        totalAmount: totalAmount,
        status: OrderStatus.PENDING,
        shippingAddress: createOrderRequest.shippingAddress,
        paymentMethod: createOrderRequest.paymentMethod,
      });
      const savedOrder = await queryRunner.manager.save(newOrder);

      const orderItems: OrderItem[] = createOrderRequest.items.map(item => {
        const product = productsMap.get(item.productId);
        return this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productName: product.name,
          priceAtOrder: product.price,
          quantity: item.quantity,
        });
      });
      await queryRunner.manager.save(orderItems);

      // 4. Decrease stock in Product Service
      const decreaseStockRequests: DecreaseStockRequest[] = createOrderRequest.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      for (const req of decreaseStockRequests) {
        const decreaseStockResponse: DecreaseStockResponse = await firstValueFrom(
          this.productServiceClient.decreaseStock(req)
        );
        if (!decreaseStockResponse || !decreaseStockResponse.success) {
          throw new RpcException(`Failed to decrease stock for product ${req.productId}. Stock update failed.`);
        }
      }

      // 5. Initiate payment via Payment Service
      // Sử dụng ProcessPaymentRequest và PaymentResponse như trong payment.proto
      const processPaymentReq: ProcessPaymentRequest = {
        orderId: savedOrder.id,
        userId: savedOrder.userId,
        amount: savedOrder.totalAmount,
        currency: 'VND',
        paymentMethod: savedOrder.paymentMethod,
      };
      const paymentResponse: PaymentResponse = await firstValueFrom(
        this.paymentServiceClient.processPayment(processPaymentReq)
      );

      if (!paymentResponse || !paymentResponse.payment || paymentResponse.payment.status !== PaymentStatusProto.SUCCESS) {
        throw new RpcException('Payment failed. Rolling back order and stock changes.');
      }

      // 6. Update order status based on payment success
      savedOrder.status = OrderStatus.PROCESSING;
      await queryRunner.manager.save(savedOrder);

      await queryRunner.commitTransaction();

      this.rabbitmqClient.emit('order_created', {
        orderId: savedOrder.id,
        userId: savedOrder.userId,
        totalAmount: savedOrder.totalAmount,
        status: OrderStatusProto.PENDING,
        timestamp: new Date().toISOString(),
      })
      .subscribe({
        next: () => console.log(`[OrderService] Event 'order_created' sent for Order ID: ${savedOrder.id}`),
        error: (err) => console.error(`[OrderService] Failed to send 'order_created' event:`, err),
      });

      return { order: this.mapOrderToProto(savedOrder, orderItems) };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('[OrderService] Order creation failed:', error);
      // Đảm bảo RpcException message được truyền đúng
      throw new RpcException(error.message || 'Failed to create order due to an internal error.');
    } finally {
      await queryRunner.release();
    }
  }


  async getOrderById(getOrderByIdRequest: GetOrderByIdRequest): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({
      where: { id: getOrderByIdRequest.id },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException('Order not found.');
    }

    return { order: this.mapOrderToProto(order) };
  }


  async getOrdersByUserId(getOrdersByUserIdRequest: GetOrdersByUserIdRequest): Promise<OrdersResponse> {
    const { userId, page = 1, limit = 10 } = getOrdersByUserIdRequest;
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await this.orderRepository.findAndCount({
      where: { userId: userId },
      relations: ['items'],
      skip: skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      orders: orders.map(order => this.mapOrderToProto(order)),
      totalCount: totalCount,
      page: page,
      limit: limit,
    };
  }


  async updateOrderStatus(updateOrderStatusRequest: UpdateOrderStatusRequest): Promise<OrderResponse> {
    const { id, status, note } = updateOrderStatusRequest;
    const order = await this.orderRepository.findOne({ where: { id: id } });

    if (!order) {
      throw new RpcException('Order not found.');
    }
    const oldStatus = order.status;
    order.status = OrderStatus[OrderStatusProto[status]]
    
    const updatedOrder = await this.orderRepository.save(order);

    // this.rabbitmqClient.emit('order_created', {
    //   orderId: updatedOrder.id,
    //   userId: updatedOrder.userId,
    //   totalAmount: updatedOrder.totalAmount,
    //   status: 'pending',
    //   timestamp: new Date().toISOString(),
    // })
    // .subscribe({
    //   next: () => console.log(`[OrderService] Event 'order_updated' sent for Order ID: ${updatedOrder.id}`),
    //   error: (err) => console.error(`[OrderService] Failed to send 'order_created' event:`, err),
    // });

    return { order: this.mapOrderToProto(updatedOrder) };
  }
}