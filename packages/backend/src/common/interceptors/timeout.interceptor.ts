import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

// 用于处理请求超时
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  // 接收一个可选参数 time，默认值为 10000 毫秒（10秒），用于设置请求超时的时长。
  constructor(private readonly time: number = 10000) {}

  // 拦截器的核心，接受 ExecutionContext 和 CallHandler 两个参数，返回一个 Observable 。
  // > ExecutionContext 提供有关当前请求的信息
  // > CallHandler 用于处理请求的后续操作
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 调用 next.handle() 获取处理请求的流，并通过 pipe 添加超时处理
    return next.handle().pipe(
      // 在指定时间内未完成请求时抛出 TimeoutError
      timeout(this.time),
      // 用于捕获错误，如果是 TimeoutError，则抛出一个新的 RequestTimeoutException，表示请求超时；否则，原样抛出其他错误。
      catchError((err) => {
        if (err instanceof TimeoutError)
          return throwError(() => new RequestTimeoutException('请求超时'))

        return throwError(() => err)
      }),
    )
  }
}
