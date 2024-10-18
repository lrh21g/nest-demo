import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import qs from 'qs'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { BYPASS_KEY } from '../decorators'
import { ResOp } from '../model/response.model'

// 用于统一处理接口请求和响应的结果。如果某个处理程序不需要这种处理，可以使用 @Bypass 装饰器。
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  // 拦截器的核心，接受 ExecutionContext 和 CallHandler 两个参数。
  // > ExecutionContext 提供有关当前请求的信息
  // > CallHandler 用于处理请求的后续操作
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // 使用 Reflector 获取当前处理程序的元数据.
    const bypass = this.reflector.get<boolean>(
      BYPASS_KEY,
      context.getHandler(), // 获取处理请求的调用，返回一个 Observable ，代表路由处理程序响应流
    )

    // 如果存在 @Bypass 装饰器，则 bypass 为 true，直接返回处理请求的流。
    if (bypass)
      return next.handle()

    const http = context.switchToHttp()
    const request = http.getRequest()

    // 使用 qs 库解析查询参数，将数组参数转换为数组,如：?a[]=1&a[]=2 => { a: [1, 2] }
    request.query = qs.parse(request.url.split('?').at(1))

    // 调用 next.handle() 处理请求，并使用 pipe 操作符对响应数据进行转换
    return next.handle().pipe(
      // 使用 map 操作符将响应数据封装到 ResOp 模型中，返回状态码 HttpStatus.OK 和原始数据（或 null）
      map((data) => {
        return new ResOp(HttpStatus.OK, data ?? null)
      }),
    )
  }
}
