// File: libs/common/src/lib/enums/payment/payment-status.enum.ts

export enum PaymentStatus {
  // Đang chờ xử lý thanh toán
  PENDING = 'pending',

  // Thanh toán thành công
  SUCCESS = 'success',

  // Thanh toán thất bại
  FAILED = 'failed',

  // Giao dịch đã bị từ chối
  DECLINED = 'declined',

  // Đang chờ hoàn tiền
  REFUND_PENDING = 'refund_pending',

  // Đã hoàn tiền thành công
  REFUNDED = 'refunded',

  // Đã hủy giao dịch (trước khi capture)
  CANCELLED = 'cancelled',
}