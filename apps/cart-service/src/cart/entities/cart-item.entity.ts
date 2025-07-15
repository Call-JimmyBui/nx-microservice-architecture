import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
// Import Product entity nếu bạn có thể truy cập nó từ Cart Service (thường là không trực tiếp)
// Hoặc chỉ lưu productId và dùng gRPC để lấy thông tin sản phẩm
// import { Product } from '../../product-service/src/products/entities/product.entity'; // Không nên import trực tiếp giữa các service

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string; // Chỉ lưu ID sản phẩm

  @Column('int')
  quantity: number;

  // Giá sản phẩm tại thời điểm thêm vào giỏ (để tránh thay đổi giá)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtAddition: number;

  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column()
  cartId: string;
}