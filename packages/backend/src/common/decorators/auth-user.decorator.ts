import { createParamDecorator, ExecutionContext } from '@nestjs/common'

// AuthUser 用于在处理请求时从 HTTP 请求对象中提取用户信息，并将其作为控制器方法的参数进行传递。
// 通过检查 user 对象中的某个标志（Symbol.for('isPublic')）来决定是否返回该用户对象。
// eg： @AuthUser() 装饰器从当前请求中提取 user 对象并将其注入到 getProfile 方法中。如果 request.user 存在并且没有 isPublic 标志，那么它返回用户对象；否则返回 undefined。
// getProfile(@AuthUser() user: UserEntity) {
//   return user;
// }
export function AuthUser() {
  // createParamDecorator 用于创建自定义的参数装饰器。
  // 装饰器可以直接用于控制器方法的参数，允许从请求上下文中提取信息并传递给控制器。
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    // 从 ExecutionContext 中获取当前的 HTTP 请求对象（request）。
    const request = context.switchToHttp().getRequest()
    // request.user 是在身份验证中间件（如 Passport.js）或守卫中附加到请求对象上的经过身份验证的用户对象。此时，用户应该已经通过身份验证，并且相关信息存储在 request.user 中。
    const user = request.user

    // 如果用户对象存在并且带有这个符号，表示这个用户是“公共用户”（或未经过身份验证的用户），因此该函数直接返回 undefined，表示不传递该用户对象。
    if (user?.[Symbol.for('isPublic')])
      return

    return user
  })()
}
