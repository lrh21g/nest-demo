import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard as NestAuthGuard } from '@nestjs/passport'

import { Observable } from 'rxjs'
import { AuthStrategy } from '~/constants'
import { AuthService } from '~/modules/auth/auth.service'
import { TokenService } from '~/modules/auth/token.service'
import { PUBLIC_ROUTE_KEY } from '../decorators'

// 自定义的 AuthGuard （认证守卫），用于处理不同类型的身份证策略。根据传染的选项动态选择认证策略。
// 默认情况下，使用 JWT 策略进行身份验证。
// 如果 options.public 为 true，那么守卫将首先使用 jwt 策略进行身份验证，验证失败后会尝试使用 public 策略。这就允许为某些请求提供公共访问的选项。
// eg: @UseGuards(AuthGuard({ public: true }))
// @Injectable()
// export function AuthGuard(options?: Partial<{ public: boolean }>): Type<IAuthGuard> {
//   const strategies = [AuthStrategy.JWT]

//   if (options?.public) {
//     strategies.push(AuthStrategy.PUBLIC)
//   }

//   return NestAuthGuard(strategies)
// }

@Injectable()
export class AuthGuard extends NestAuthGuard(AuthStrategy.JWT) {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {
    super()
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 是否是公共路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic)
      return true
    // 校验token
    return super.canActivate(context)
  }

  handleRequest(err, user, _info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user)
      throw err || new UnauthorizedException()

    return user
  }
}

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private authService: AuthService,
//     private tokenService: TokenService,
//     private jwtService: JwtService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest()
//     const token = this.extractTokenFromHeader(request)
//     if (!token) {
//       throw new UnauthorizedException()
//     }
//     try {
//       const payload = await this.jwtService.verifyAsync(
//         token,
//       )
//       // 💡 在这里我们将 payload 挂载到请求对象上
//       // 以便我们可以在路由处理器中访问它
//       request.user = payload
//     }
//     catch {
//       throw new UnauthorizedException()
//     }
//     return true
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? []
//     return type === 'Bearer' ? token : undefined
//   }
// }
