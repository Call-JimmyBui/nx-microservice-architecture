import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

export class GrpcExceptionFactory {
  static alreadyExists(field: any): RpcException {
    return this.create(field, GrpcStatus.ALREADY_EXISTS);
  }

  static notFound(field: any): RpcException {
    return this.create(field, GrpcStatus.NOT_FOUND);
  }

  static invalid(field: any): RpcException {
    return this.create(field, GrpcStatus.INVALID_ARGUMENT);
  }

  static unauthenticated(field: any): RpcException {
    return this.create(field, GrpcStatus.UNAUTHENTICATED);
  }

  static permissionDenied(field: any): RpcException {
    return this.create(field, GrpcStatus.PERMISSION_DENIED);
  }

  static failedPrecondition(field: any): RpcException {
    return this.create(field, GrpcStatus.FAILED_PRECONDITION);
  }

  static unavailable(field: any): RpcException {
    return this.create(field, GrpcStatus.UNAVAILABLE);
  }

  static unknown(field: any): RpcException {
    return this.create(field, GrpcStatus.UNKNOWN);
  }

  static create(field: any, code: number): RpcException {
    const message = this.generateMessage(field, code);

    return new RpcException({
      code,
      message,
    });
  }

  private static generateMessage(field: any, code: number): string {
    switch (code) {
      case GrpcStatus.ALREADY_EXISTS:
        return `${field} already exists`;
      case GrpcStatus.NOT_FOUND:
        return `${field} not found`;
      case GrpcStatus.INVALID_ARGUMENT:
        return `${field} is invalid`;
      case GrpcStatus.PERMISSION_DENIED:
        return `Permission denied for ${field}`;
      case GrpcStatus.UNAUTHENTICATED:
        return `Unauthenticated access for ${field}`;
      case GrpcStatus.FAILED_PRECONDITION:
        return `Failed precondition for ${field}`;
      case GrpcStatus.UNAVAILABLE:
        return `Service unavailable while processing ${field}`;
      default:
        return `Unexpected error occurred for ${field}`;
    }
  }
}
