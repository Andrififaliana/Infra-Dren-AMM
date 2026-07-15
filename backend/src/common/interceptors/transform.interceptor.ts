import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T> | PaginatedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T> | PaginatedResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
          return {
            success: true,
            data: response.data,
            meta: response.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
