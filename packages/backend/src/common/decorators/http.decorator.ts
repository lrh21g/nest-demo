import {
  applyDecorators,
  Param,
  ParseUUIDPipe,
  PipeTransform,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Type } from '@nestjs/common/interfaces'
import { IAuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'

import { RoleType } from '~/constants'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PublicGuard } from '../guards/public.guard'
import { RolesGuard } from '../guards/roles.guard'
import { AuthUserInterceptor } from '../interceptors/auth-user.interceptor'
import { PublicRoute } from './public-route.decorator'
import { Roles } from './roles.decorator'

// Auth 装饰器用于为某个路由（处理器方法）添加身份验证、角色控制等功能。它通过组合多个装饰器来实现这些功能。
export function Auth(
  roles: RoleType[] = [],
  options?: Partial<{ public: boolean }>,
) {
  // ========== test ==========
  // return applyDecorators(
  //   UseGuards(AuthGuard),
  // )

  // ===========================

  const isPublicRoute = options?.public

  const authGuardList: Type<IAuthGuard>[] = [JwtAuthGuard]
  if (options?.public)
    authGuardList.push(PublicGuard)

  // applyDecorators 用于聚合多个装饰器。
  return applyDecorators(
    // 用于标记该路由需要的角色。
    Roles(roles),
    // 使用守卫 AuthGuard 和 RolesGuard 进行身份验证和角色检查。其中，AuthGuard 的行为取决于 public 参数。
    UseGuards(...[...authGuardList, RolesGuard]),
    // 为 Swagger 文档生成 Bearer 认证信息。
    ApiBearerAuth(),
    // 使用拦截器 AuthUserInterceptor，用于拦截请求，获取经过认证的用户信息，并将其存储在一个全局的上下文中，方便后续处理中访问。
    UseInterceptors(AuthUserInterceptor),
    // 在 Swagger 文档中为未授权的响应提供描述。
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    // 用于标记路由是否为公开路由（不需要身份验证）
    PublicRoute(isPublicRoute),
  )
}

// UUIDParam 用于验证传入的 URL 参数是否是有效的 UUID（版本4）。
export function UUIDParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  // 通过 @Param 装饰器来处理指定的 property（URL 参数），并使用 ParseUUIDPipe 验证该参数是否是版本 4 的 UUID。如果需要，还可以附加其他管道处理参数。
  return Param(
    property,
    new ParseUUIDPipe({
      version: '4',
      exceptionFactory: () => 'Invalid UUID',
    }),
    ...pipes,
  )
}
