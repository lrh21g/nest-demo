import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'

import { UserEntity } from '~/modules/user/user.entity'

import { ContextProvider } from '../providers'

// AuthUserInterceptor 类实现了 NestInterceptor 接口，并被标记为 @Injectable()，用于依赖注入。
// AuthUserInterceptor 类的作用是拦截请求，获取经过认证的用户信息，并将其存储在一个全局的上下文中，方便后续处理中访问。
@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  // 拦截器的核心，接受 ExecutionContext 和 CallHandler 两个参数。
  // > ExecutionContext 提供有关当前请求的信息
  // > CallHandler 用于处理请求的后续操作
  intercept(context: ExecutionContext, next: CallHandler) {
    // ExecutionContext 提供了请求的上下文信息。
    // 通过 switchToHttp() 方法，将执行上下文切换为 HTTP 上下文，并通过 getRequest() 获取当前的 HTTP 请求对象。
    const request = context.switchToHttp().getRequest()
    // 从请求对象中提取 user 属性。通常，在通过身份验证的请求中，user 字段会包含当前经过认证的用户信息。
    const user = request.user as UserEntity

    // 调用 ContextProvider 的 setAuthUser(user) 方法，将当前的用户存储在全局上下文中。
    ContextProvider.setAuthUser(user)

    // CallHandler 用于控制请求的后续执行流程，通常用于将控制权交给下一个处理器。
    // next.handle() 将控制权交给下一个处理器，允许请求继续向下传递（通常是到控制器方法）。拦截器一般会在执行一些自定义逻辑后调用这个方法来确保请求正常处理。
    return next.handle()
  }
}
