// libs/dto/src/lib/order.dto.ts (hoặc vị trí DTO của bạn)

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID('4', { message: 'Mã sản phẩm phải là UUID v4 hợp lệ.' })
  @IsNotEmpty({ message: 'Mã sản phẩm không được để trống.' })
  productId!: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    example: 2,
  })
  @IsNumber({}, { message: 'Số lượng sản phẩm phải là một số.' })
  @IsInt({ message: 'Số lượng sản phẩm phải là số nguyên.' })
  @Min(1, { message: 'Số lượng sản phẩm phải lớn hơn hoặc bằng 1.' })
  @IsNotEmpty({ message: 'Số lượng sản phẩm không được để trống.' })
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của người dùng đặt hàng',
    example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210',
  })
  @IsUUID('4', { message: 'Mã người dùng phải là UUID v4 hợp lệ.' })
  @IsNotEmpty({ message: 'Mã người dùng không được để trống.' })
  userId!: string;

  @ApiProperty({
    description: 'Danh sách các sản phẩm trong đơn hàng',
    type: [OrderItemDto],
  })
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất một sản phẩm.' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}