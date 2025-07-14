// E:\microservice\apps\api-gateway\src\common\interceptors\timestamp.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import Long from 'long';

@Injectable()
export class TimestampInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformTimestamps(data))
    );
  }

  private transformTimestamps(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.transformTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          // Kiểm tra xem đây có phải là đối tượng Protobuf Timestamp không
          if (value && typeof value === 'object' &&
              value.seconds && typeof value.seconds === 'object' &&
              Object.prototype.hasOwnProperty.call(value.seconds, 'low') &&
              Object.prototype.hasOwnProperty.call(value.seconds, 'high') &&
              Object.prototype.hasOwnProperty.call(value, 'nanos')) {
            
            const seconds = new Long(value.seconds.low, value.seconds.high, value.seconds.unsigned).toNumber();
            const date = new Date(seconds * 1000 + (value.nanos / 1_000_000));
            data[key] = date;
          } else if (typeof value === 'object') {
            data[key] = this.transformTimestamps(value);
          }
        }
      }
    }
    return data;
  }
}