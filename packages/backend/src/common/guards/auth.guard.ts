import { IAuthGuard, AuthGuard as NestAuthGuard, Type } from '@nestjs/passport'

// 自定义的 AuthGuard （认证守卫），用于处理不同类型的身份证策略。根据传染的选项动态选择认证策略。
// 默认情况下，使用 JWT 策略进行身份验证。
// 如果 options.public 为 true，那么守卫将首先使用 jwt 策略进行身份验证，验证失败后会尝试使用 public 策略。这就允许为某些请求提供公共访问的选项。
// eg: @UseGuards(AuthGuard({ public: true }))
export function AuthGuard(options?: Partial<{ public: boolean }>): Type<IAuthGuard> {
  const strategies = ['jwt']

  if (options?.public) {
    strategies.push('public')
  }

  return NestAuthGuard(strategies)
}
