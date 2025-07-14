// apps/api-gateway/src/common/utils/grpc-error.mapper.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';

export function mapGrpcErrorToHttp(error: any): HttpException {
  
  const grpcCode = error?.code;
  const message = error?.details || error?.message || 'Internal server error';

  let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  switch (grpcCode) {
    case GrpcStatus.INVALID_ARGUMENT:
      httpStatus = HttpStatus.BAD_REQUEST;
      break;
    case GrpcStatus.NOT_FOUND:
      httpStatus = HttpStatus.NOT_FOUND;
      break;
    case GrpcStatus.ALREADY_EXISTS:
      httpStatus = HttpStatus.CONFLICT;
      break;
    case GrpcStatus.PERMISSION_DENIED:
      httpStatus = HttpStatus.FORBIDDEN;
      break;
    case GrpcStatus.UNAUTHENTICATED:
      httpStatus = HttpStatus.UNAUTHORIZED;
      break;
    case GrpcStatus.FAILED_PRECONDITION:
      httpStatus = HttpStatus.BAD_REQUEST;
      break;
    case GrpcStatus.UNAVAILABLE:
      httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
      break;
    // Có thể thêm các case khác nếu cần
    default:
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      break;
  }

  return new HttpException(message, httpStatus);
}
