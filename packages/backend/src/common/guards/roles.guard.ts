import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleType } from '~/constants'

import { UserEntity } from '~/modules/user/user.entity'

// 自定义 RolesGuard （角色权限守卫），用于进行基于角色控制访问权限。
// RolesGuard 会检查路由处理程序是否要求特定角色，如果有，则确保当前请求的用户角色符合要求。如果路由没有设置任何角色限制，则请求默认通过。
// 该类必须实现 CanActivate 接口的 canActivate 方法。
// CanActivate 是一个 NestJS 接口，用于控制是否允许某个请求继续执行。它的返回值决定了请求是否可以通过守卫。
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector 是 NestJS 提供的一个工具类，用于从元数据中获取信息。元数据通常通过装饰器设置。
  constructor(private reflector: Reflector) {}

  // canActivate 是守卫的核心逻辑，用于决定请求是否被允许继续处理。返回 true 表示请求通过守卫，返回 false 则表示请求被阻止。
  // context 参数是 ExecutionContext，它提供了请求的上下文信息，允许守卫获取关于当前处理的路由、请求对象等信息。
  canActivate(context: ExecutionContext): boolean {
    // 从当前处理请求的方法上获取使用 @Roles 装饰器指定的角色列表。
    const roles = this.reflector.get<RoleType[] | undefined>(
      'roles', // 获取的元数据名称
      context.getHandler(), // 返回当前请求所调用的处理程序（即控制器中的某个方法）。元数据通常是定义在控制器方法上，表示该方法需要特定的角色才能访问。
    )

    // 如果 roles 没有定义（即该路由不要求特定角色）或者 roles 数组为空，那么守卫返回 true，即没有角色限制的情况下请求默认通过。
    if (!roles?.length) {
      return true
    }

    // 从上下文中提取 HTTP 请求对象的方法。守卫通常用于 HTTP 请求，但它也可以用于 WebSocket 或其他上下文。
    // user 属性通常是在身份验证通过后附加到请求对象中的，表示当前的用户信息。
    const request = context.switchToHttp().getRequest<{ user: UserEntity }>()
    // 从请求对象中提取 user 对象，该对象包含了用户的所有信息，包括角色 (role)。
    const user = request.user

    // 如果 roles 数组包含 user.role，则返回 true，表示该用户有权限访问该路由。否则返回 false，拒绝访问。
    return roles.includes(user.role)
  }
}
