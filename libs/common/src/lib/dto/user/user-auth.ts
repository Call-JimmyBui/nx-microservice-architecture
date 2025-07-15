import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UserRegisterRequestDto {
  @ApiProperty({ example: 'john.doe', description: 'Tên đăng nhập' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @IsString()
  password!: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email người dùng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'John', description: 'Tên', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Họ', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class UserLoginRequestDto {
  @ApiProperty({ example: 'john.doe' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class UserAuthResponseDto {
    token!: string
}