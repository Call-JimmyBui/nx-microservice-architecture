// E:\microservice\apps\user-service\src\users\user.service.ts

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateUserRequest,
  UpdateUserRequest,
  UserProto,
  AuthenticationResponse,
  UserRoleProto,
} from '@microservice/types';

import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole, GrpcExceptionFactory, UserFieldKey } from '@microservice/common';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(request: CreateUserRequest): Promise<UserProto> {

    const existingUserByUsername = await this.userRepository.findOne({ where: { username: request.username } });
    if (existingUserByUsername) {
      throw GrpcExceptionFactory.create(UserFieldKey.USERNAME, GrpcStatus.ALREADY_EXISTS);
    }

    const existingUserByEmail = await this.userRepository.findOne({ where: { email: request.email } });
    if (existingUserByEmail) {
      throw GrpcExceptionFactory.create(UserFieldKey.EMAIL, GrpcStatus.ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    // Tạo đối tượng User mới từ request
    const newUser = this.userRepository.create({
      username: request.username,
      email: request.email,
      passwordHash: hashedPassword,
      phoneNumber: request.phoneNumber,
      firstName: request.firstName,
      lastName: request.lastName,
      role: request.role ?? UserRole[UserRole[UserRoleProto.CUSTOMER]],
      isActive: true,
      deviceToken: '', 
    });

    await this.userRepository.save(newUser);

    return this.toUserProto(newUser);
  }

  async getUserById(id: string): Promise<UserProto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw GrpcExceptionFactory.create(UserFieldKey.USER, GrpcStatus.NOT_FOUND);
    }
    return this.toUserProto(user) ;
  }

  async getUserByUsername(username: string): Promise<UserProto> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw GrpcExceptionFactory.create(UserFieldKey.USER, GrpcStatus.NOT_FOUND);
    }
    return this.toUserProto(user) ;
  }

  async getAllUsers(): Promise<UserProto[]> {
    const users = await this.userRepository.find();
    return users.map(user => this.toUserProto(user));
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<UserProto | undefined> {

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // Cập nhật các trường nếu chúng được cung cấp trong request
    if (request.username !== undefined) user.username = request.username;
    if (request.email !== undefined) user.email = request.email;
    if (request.phoneNumber !== undefined) user.phoneNumber = request.phoneNumber;
    if (request.firstName !== undefined) user.firstName = request.firstName;
    if (request.lastName !== undefined) user.lastName = request.lastName;
    if (request.isActive !== undefined) user.isActive = request.isActive;
    if (request.role !== undefined) user.role = UserRole[UserRoleProto[request.role]];

    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    return this.toUserProto(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const deleteResult = await this.userRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }

  async authenticateUser(username: string, password: string): Promise<AuthenticationResponse> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user || !user.username) {
      throw GrpcExceptionFactory.create(UserFieldKey.USERNAME, GrpcStatus.NOT_FOUND);
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw GrpcExceptionFactory.create(UserFieldKey.PASSWORD, GrpcStatus.UNAUTHENTICATED);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload); // Sign token

    return {
      success: true,
      message: 'Authentication successful',
      accessToken: accessToken,
      user: this.toUserProto(user),
    };
  }


    private toUserProto(user: User): UserProto {
      
      const createdAtSeconds = Math.floor(user.createdAt.getTime() / 1000);
      const createdAtNanos = (user.createdAt.getTime() % 1000) * 1_000_000;
      
      const updatedAtSeconds = Math.floor(user.updatedAt.getTime() / 1000);
      const updatedAtNanos = (user.updatedAt.getTime() % 1000) * 1_000_000;

      const a =  {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: { seconds: createdAtSeconds, nanos: createdAtNanos },
        updatedAt: { seconds: updatedAtSeconds, nanos: updatedAtNanos },
        isActive: user.isActive,
        role: user.role ?? UserRole[UserRole[UserRoleProto.CUSTOMER]],
        deviceToken: user.deviceToken || '',
      };
      console.log('mmmmmmmmmmmmmmmmmm', a);
      
      return a
    }
}