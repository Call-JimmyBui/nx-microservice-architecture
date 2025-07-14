
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import {
  CreateUserRequest,
  GetUserByIdRequest,
  GetUserByUsernameRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  AuthenticateUserRequest,
  UserResponse,
  UsersResponse,
  AuthenticationResponse,
  UserServiceController, 
  UserServiceControllerMethods, 
  USERS_PACKAGE_NAME, 
} from '@microservice/types'; 
import { Empty } from '@microservice/types'; 

@Controller()
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USERS_PACKAGE_NAME, 'CreateUser')
  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const user = await this.userService.createUser(request);        
    return { user }; 
  }

  @GrpcMethod(USERS_PACKAGE_NAME, 'GetUserById')
  async getUserById(request: GetUserByIdRequest): Promise<UserResponse> {
    const user = await this.userService.getUserById(request.id);
      return { user }; 
  }

  @GrpcMethod(USERS_PACKAGE_NAME, 'GetUserByUsername')
  async getUserByUsername(request: GetUserByUsernameRequest): Promise<UserResponse> {
    const user = await this.userService.getUserByUsername(request.username);
    return { user };
  }

  @GrpcMethod(USERS_PACKAGE_NAME, 'GetAllUsers')
  async getAllUsers(request: Empty): Promise<UsersResponse> {
    const users = await this.userService.getAllUsers();
    return { users }; 
  }

  @GrpcMethod(USERS_PACKAGE_NAME, 'UpdateUser')
  async updateUser(request: UpdateUserRequest): Promise<UserResponse> {
    const updatedUser = await this.userService.updateUser(request.id, request);
    if (!updatedUser) {
      return { user: undefined }; 
    }
    return { user: updatedUser };
  }

  @GrpcMethod(USERS_PACKAGE_NAME, 'DeleteUser')
  async deleteUser(request: DeleteUserRequest): Promise<Empty> {
    await this.userService.deleteUser(request.id);
    return {}; 
  }

  @GrpcMethod(USERS_PACKAGE_NAME, 'AuthenticateUser')
  async authenticateUser(request: AuthenticateUserRequest): Promise<AuthenticationResponse> {
    const authResult = await this.userService.authenticateUser(request.username, request.password);
    return authResult; 
  }
}