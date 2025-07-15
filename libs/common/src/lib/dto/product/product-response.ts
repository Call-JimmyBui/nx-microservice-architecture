
import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './create-product';

export class ProductResponseDto {
  @ApiProperty({ example: 'xyz123abc-product-id' })
  id!: string;

  @ApiProperty({ example: 'Laptop XYZ' })
  name!: string;

  @ApiProperty({ example: 'Mô tả chi tiết về sản phẩm...' })
  description!: string;

  @ApiProperty({ example: 1200.50 })
  price!: number;

  @ApiProperty({ example: 50 })
  stockQuantity!: number;

  @ApiProperty({ example: 'http://example.com/image.jpg' })
  imageUrl!: string;

  @ApiProperty({ type: () => CategoryResponseDto })
  category!: CategoryResponseDto;

  @ApiProperty({ example: '2025-07-10T08:00:00.000Z' })
  createdAt!: Date;
}