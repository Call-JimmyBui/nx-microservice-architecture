// types/proto/index.ts

// Từ products.ts
export {
  PRODUCTS_PACKAGE_NAME,
  PRODUCT_SERVICE_NAME,
  CATEGORY_SERVICE_NAME,
  protobufPackage as ProductsProtobufPackage,
  ProductProto,
  CreateProductRequest,
  GetProductByIdRequest,
  GetAllProductsRequest,
  UpdateProductRequest,
  DeleteProductRequest,
  DeleteProductResponse,
  GetProductsByCategoryIdRequest,
  CheckProductStockRequest,
  CheckProductStockResponse,
  ProductResponse,
  ProductsResponse,
  DecreaseStockRequest,  
  DecreaseStockResponse,
  GetProductsByIdsRequest,
  CategoryProto,
  CreateCategoryRequest,
  GetCategoryByIdRequest,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
  CategoryResponse,
  CategoriesResponse,
  ProductServiceClient,
  ProductServiceController,
  CategoryServiceController,
  ProductServiceControllerMethods,
  CategoryServiceControllerMethods,  
} from './products';


// Từ notifications.ts
export {
  NOTIFICATION_SERVICE_NAME,
  NOTIFICATIONS_PACKAGE_NAME,
  protobufPackage as NotificationsProtobufPackage,
  NotificationServiceClient,
  NotificationServiceControllerMethods,
  NotificationServiceController,
  SendEmailRequest,
  SendSmsRequest,
  SendPushNotificationRequest,
  NotificationTypeProto,
} from './notifications';


// Từ orders.ts
export {
  ORDER_SERVICE_NAME,
  ORDERS_PACKAGE_NAME,
  protobufPackage as OrdersProtobufPackage,
  OrderProto,
  OrderItemProto,
  CreateOrderRequest,
  GetOrderByIdRequest,
  GetOrdersByUserIdRequest,
  UpdateOrderStatusRequest,
  OrderResponse,
  OrdersResponse,
  OrderStatusProto,
  OrderServiceClient,
  OrderServiceControllerMethods,
  OrderServiceController,
} from './orders';


// Từ payments.ts
export {
  PAYMENTS_PACKAGE_NAME,
  PAYMENT_SERVICE_NAME,
  protobufPackage as PaymentsProtobufPackage,
  PaymentProto,
  ProcessPaymentRequest,
  GetPaymentStatusRequest,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentStatusProto,
  PaymentServiceClient,
  PaymentServiceControllerMethods,
  PaymentServiceController,
} from './payments';


// Từ users.ts
export {
  USER_SERVICE_NAME,
  USERS_PACKAGE_NAME,
  protobufPackage as UsersProtobufPackage,
  UserProto,
  CreateUserRequest,
  GetUserByIdRequest,
  GetUserByUsernameRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  AuthenticateUserRequest,
  AuthenticationResponse,
  UserResponse,
  UsersResponse,
  UserRoleProto,
  UserServiceClient,
  UserServiceController,
  UserServiceControllerMethods,
} from './users';


// Từ carts.ts
export {
  CARTS_PACKAGE_NAME,
  CART_SERVICE_NAME,
  protobufPackage as CartsProtobufPackage,
  CartProto,
  CartItemProto,
  AddItemToCartRequest,
  GetCartRequest,
  UpdateCartItemQuantityRequest,
  RemoveItemFromCartRequest,
  ClearCartRequest,
  CartResponse,
  CartServiceClient,
  CartServiceControllerMethods,
  CartServiceController,
} from './carts';