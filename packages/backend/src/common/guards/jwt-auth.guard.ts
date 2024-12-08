import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import Redis from 'ioredis'
import { isEmpty, isNil } from 'lodash'
import { ExtractJwt } from 'passport-jwt'

import { InjectRedis } from '~/common/decorators'
import { AppConfig, IAppConfig, routerWhiteList } from '~/config'
import { AuthStrategy, ErrorEnum, PUBLIC_KEY } from '~/constants'
import { AuthService } from '~/modules/auth/auth.service'
import { TokenService } from '~/modules/auth/token.service'
import { genTokenBlacklistKey } from '~/utils'
import { BusinessException } from '../exceptions'

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
  jwtFromRequestFn = ExtractJwt.fromAuthHeaderAsBearerToken()

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private tokenService: TokenService,
    @InjectRedis() private readonly redis: Redis,
    @Inject(AppConfig.KEY) private appConfig: IAppConfig,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(
      PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    )
    const request = context.switchToHttp().getRequest()

    if (routerWhiteList.includes(request.route.path))
      return true

    const isSse = request.headers.accept === 'text/event-stream'
    if (isSse && !request.headers.authorization?.startsWith('Bearer ')) {
      const { token } = request.query
      if (token)
        request.headers.authorization = `Bearer ${token}`
    }

    const token = this.jwtFromRequestFn(request)
    // 检查 token 是否在黑名单中
    if (await this.redis.get(genTokenBlacklistKey(token)))
      throw new BusinessException(ErrorEnum.INVALID_LOGIN)

    request.accessToken = token

    let result: any = false
    try {
      result = await super.canActivate(context)
    }
    catch (err) {
      // 需要后置判断，这样携带了 token 的用户就能够解析到 request.user
      if (isPublic)
        return true

      if (isEmpty(token))
        throw new UnauthorizedException('未登录')

      // 在 handleRequest 中 user 为 null 时会抛出 UnauthorizedException
      if (err instanceof UnauthorizedException)
        throw new BusinessException(ErrorEnum.INVALID_LOGIN)

      // 判断 token 是否有效且存在, 如果不存在则认证失败
      const isValid = isNil(token)
        ? undefined
        : await this.tokenService.checkAccessToken(token!)

      if (!isValid)
        throw new BusinessException(ErrorEnum.INVALID_LOGIN)
    }

    // 处理 SSE 请求
    if (isSse) {
      const { uid } = request.params

      if (Number(uid) !== request.user.uid)
        throw new UnauthorizedException('路径参数 uid 与当前 token 登录的用户 uid 不一致')
    }

    // 获取密码版本
    const pv = await this.authService.getPasswordVersionByUid(request.user.uid)
    if (pv !== `${request.user.pv}`) {
      // 密码版本不一致，登录期间已更改过密码
      throw new BusinessException(ErrorEnum.INVALID_LOGIN)
    }

    // 不允许多端登录
    if (!this.appConfig.multiDeviceLogin) {
      const cacheToken = await this.authService.getTokenByUid(request.user.uid)

      if (token !== cacheToken) {
        // 与 redis 保存不一致，即二次登录
        throw new BusinessException(ErrorEnum.ACCOUNT_LOGGED_IN_ELSEWHERE)
      }
    }

    return result
  }

  // 验完成后调用
  handleRequest(err, user, _info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user)
      throw err || new UnauthorizedException()

    return user
  }
}
