import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { ALLOW_ANON_KEY, ErrorEnum, PERMISSION_KEY, PUBLIC_KEY, Roles } from '~/constants'
import { AuthService } from '~/modules/auth/auth.service'
import { BusinessException } from '../exceptions'

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // PUBLIC_KEY 无需登录即可访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (isPublic)
      return true

    // 用户是否登录
    const request = context.switchToHttp().getRequest<Request>()
    const { user } = request
    if (!user)
      throw new BusinessException(ErrorEnum.INVALID_LOGIN)

    // ALLOW_ANON_KEY 需登录后才访问，无需权限
    const allowAnon = this.reflector.get<boolean>(
      ALLOW_ANON_KEY,
      context.getHandler(),
    )
    if (allowAnon)
      return true

    const payloadPermission = this.reflector.getAllAndOverride<string | string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )
    // 控制器没有设置接口权限，则默认通过
    if (!payloadPermission)
      return true

    // 管理员放开所有权限
    if (user.roles.includes(Roles.ADMIN))
      return true

    const allPermissions = await this.authService.getPermissionsCache(user.uid) ?? await this.authService.getPermissions(user.uid)
    let canNext = false

    if (Array.isArray(payloadPermission)) {
      // 只要有一个权限满足即可
      canNext = payloadPermission.every(i => allPermissions.includes(i))
    }

    if (typeof payloadPermission === 'string')
      canNext = allPermissions.includes(payloadPermission)

    if (!canNext)
      throw new BusinessException(ErrorEnum.NO_PERMISSION)

    return true
  }
}
