import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'

// 用于记录 HTTP 请求和响应的日志
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // 创建 Logger 实例，用于记录日志，指定类名为 LoggingInterceptor，且不记录时间戳。
  private logger = new Logger(LoggingInterceptor.name, { timestamp: false })

  // 拦截器的核心，接受 ExecutionContext 和 CallHandler 两个参数。
  // > ExecutionContext 提供有关当前请求的信息
  // > CallHandler 用于处理请求的后续操作
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // 获取处理请求的调用，返回一个 Observable ，代表路由处理程序响应流
    const call = next.handle()
    // 获取当前 HTTP 请求对象
    const request = context.switchToHttp().getRequest()
    const content = `${request.method} -> ${request.url}`

    // 检查请求头是否包含 text/event-stream，用于区分是否为 Server-Sent Events（SSE）
    // SSE 与 WebSocket 作用相似，都是建立浏览器与服务器之间的通信渠道，然后服务器向浏览器推送信息。
    // WebSocket 更强大和灵活。因为它是全双工通道，可以双向通信；SSE 是单向通道，只能服务器向浏览器发送，因为流信息本质上就是下载。如果浏览器向服务器发送信息，就变成了另一次 HTTP 请求。
    // Server-Sent Events 教程： https://www.ruanyifeng.com/blog/2017/05/server-sent_events.html
    const isSse = request.headers.accept === 'text/event-stream'

    this.logger.debug(`+++ 请求：${content}`)

    const now = Date.now()

    // 使用 pipe 和 tap 操作符在请求处理完成后执行的逻辑
    return call.pipe(
      tap(() => {
        // 如果是 SSE 请求，直接返回，不记录响应时间。
        if (isSse)
          return

        // 否则，记录响应日志，包括响应时间（请求处理耗时）
        this.logger.debug(`--- 响应：${content}${` +${Date.now() - now}ms`}`)
      },
      ),
    )
  }
}
