// libs/dto/src/lib/product.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {

  @ApiProperty({ example: 'Laptop XYZ' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Mô tả chi tiết về sản phẩm...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1200.50 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0.01, { message: 'Giá phải lớn hơn 0' })
  price!: number;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho không thể âm' })
  stockQuantity!: number;

  @ApiProperty({ example: 'http://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'ID danh mục' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Category ID không hợp lệ' })
  categoryId!: string;
}

// Category Response DTO (Nested trong ProductResponseDto)
export class CategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'Electronics' })
  name!: string;

  @ApiProperty({ example: 'Thiết bị điện tử', required: false })
  description?: string;
}