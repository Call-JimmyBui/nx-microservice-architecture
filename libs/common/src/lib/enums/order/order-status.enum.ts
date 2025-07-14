// File: libs/common/src/lib/enums/order/order-status.enum.ts

export enum OrderStatus {
  // Trạng thái ban đầu khi đơn hàng được tạo
  PENDING = 'pending',

  // Đang xử lý (thanh toán thành công, đang chuẩn bị hàng)
  PROCESSING = 'processing',

  // Đơn hàng đã được vận chuyển
  SHIPPED = 'shipped',

  // Đơn hàng đã được giao thành công
  DELIVERED = 'delivered',

  // Đơn hàng đã bị hủy
  CANCELLED = 'cancelled',

  // Đơn hàng đang chờ thanh toán (chỉ áp dụng nếu có bước chờ thanh toán riêng)
  WAITING_FOR_PAYMENT = 'waiting_for_payment',

  // Thanh toán thất bại
  PAYMENT_FAILED = 'payment_failed',

  // Trả lại hàng
  RETURNED = 'returned',

  // Hoàn tiền thành công
  REFUNDED = 'refunded',
}