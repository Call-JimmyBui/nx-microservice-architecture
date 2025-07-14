// libs/dto/src/lib/user.dto.ts (hoặc vị trí DTO của bạn)

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,   
  MinLength,  
  MaxLength, 
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Tên duy nhất của người dùng',
    example: 'John Doe',
  })
  @IsString({ message: 'Tên người dùng phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Tên người dùng không được để trống.' })
  @MinLength(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự.' })
  @MaxLength(50, { message: 'Tên người dùng không được vượt quá 50 ký tự.' })
  name!: string;

  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Email phải có định dạng hợp lệ.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự.' })
  email!: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'strongpassword',
  })
  @IsString({ message: 'Mật khẩu phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  password?: string;
}