// E:\microservice\apps\api-gateway\src\user\user.controller.ts

import {
  Controller,
  Inject,
  OnModuleInit,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Logger,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators'; 

import {
  UserServiceClient,
  USER_SERVICE_NAME,
  GetUserByIdRequest,
  GetUserByUsernameRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  AuthenticateUserRequest,
  UserResponse,
  UsersResponse,
  AuthenticationResponse,
  UserProto,
} from '@microservice/types';
import { Empty } from '@microservice/types';
import {mapGrpcErrorToHttp } from '@microservice/common'

@Controller('users') 
export class UserController implements OnModuleInit {
  private readonly logger = new Logger(UserController.name);
  private userService: UserServiceClient;

  constructor(@Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  @Post('register')
  async registerUser(@Body() data: any) {
    try {
      const result = await firstValueFrom(this.userService.createUser(data));
      return result;
    } catch (error) {
      throw mapGrpcErrorToHttp(error);
    }
  }

  @Post('login')
  async login(@Body() authenticateUserDto: AuthenticateUserRequest) {
    try {
      const response: AuthenticationResponse = await lastValueFrom(
        this.userService.authenticateUser(authenticateUserDto)
      );
      return response;
    } catch (error) {
      throw mapGrpcErrorToHttp(error);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserProto> {
    this.logger.log(`API Gateway: Get user by ID: ${id}`);
    try {
      const request: GetUserByIdRequest = { id };
      const response: UserResponse = await lastValueFrom(
        this.userService.getUserById(request) 
      );

      if (!response.user) {
        throw new HttpException(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      return response.user;
    } catch (error) {
      this.logger.error(`API Gateway Error - GetUserById: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string): Promise<UserProto> {
    this.logger.log(`API Gateway: Get user by username: ${username}`);
    try {
      const request: GetUserByUsernameRequest = { username };
      const response: UserResponse = await lastValueFrom(
        this.userService.getUserByUsername(request).pipe(
          catchError((error) => {
            this.logger.error(`gRPC Error - GetUserByUsername: ${error.details || error.message}`, error.stack);
            throw new HttpException(
              error.details || 'Internal server error while fetching user by username',
              error.code || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      if (!response.user) {
        throw new HttpException(`User with username ${username} not found`, HttpStatus.NOT_FOUND);
      }
      return response.user;
    } catch (error) {
      this.logger.error(`API Gateway Error - GetUserByUsername: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  async getAllUsers(): Promise<UserProto[]> {
    this.logger.log('API Gateway: Get all users request.');
    try {
      const emptyRequest: Empty = {};
      const response: UsersResponse = await lastValueFrom(
        this.userService.getAllUsers(emptyRequest).pipe(
          catchError((error) => {
            this.logger.error(`gRPC Error - GetAllUsers: ${error.details || error.message}`, error.stack);
            throw new HttpException(
              error.details || 'Internal server error while fetching all users',
              error.code || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return response.users;
    } catch (error) {
      this.logger.error(`API Gateway Error - GetAllUsers: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserData: UpdateUserRequest): Promise<UserProto> {
    this.logger.log(`API Gateway: Update user ID: ${id}`);
    try {
      const request: UpdateUserRequest = { ...updateUserData, id };
      const response: UserResponse = await lastValueFrom(
        this.userService.updateUser(request).pipe(
          catchError((error) => {
            this.logger.error(`gRPC Error - UpdateUser: ${error.details || error.message}`, error.stack);
            throw new HttpException(
              error.details || 'Internal server error during user update',
              error.code || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      if (!response.user) {
        throw new HttpException(`User with ID ${id} not found for update`, HttpStatus.NOT_FOUND);
      }
      return response.user;
    } catch (error) {
      this.logger.error(`API Gateway Error - UpdateUser: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    this.logger.log(`API Gateway: Delete user ID: ${id}`);
    try {
      const request: DeleteUserRequest = { id };
      await lastValueFrom(
        this.userService.deleteUser(request).pipe(
          catchError((error) => {
            this.logger.error(`gRPC Error - DeleteUser: ${error.details || error.message}`, error.stack);
            throw new HttpException(
              error.details || 'Internal server error during user deletion',
              error.code || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`API Gateway Error - DeleteUser: ${error.message}`, error.stack);
      throw error;
    }
  }
}