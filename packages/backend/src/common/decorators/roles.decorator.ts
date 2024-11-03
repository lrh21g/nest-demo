// import { Reflector } from '@nestjs/core'

// // Roles 将角色信息与路由处理方法或类关联起来，通常用于实现权限控制
// // 通过 Reflector.createDecorator<string[]>()，生成的 Roles 装饰器可以附加在类或方法上，标记该类或方法需要特定的角色才能访问。
// // 通常，Roles 装饰器会与角色守卫（guard）结合使用，以确保只有具有正确角色的用户才能访问某些资源。
// // > createDecorator 用于创建一个自定义的装饰器。此处，会接受并存储一个字符串数组，字符串数组通常用来表示角色（例如，['admin', 'user']），用于权限控制。
// export const Roles = Reflector.createDecorator<string[]>()

import { CustomDecorator, SetMetadata } from '@nestjs/common'
import { RoleType } from '~/constants'

// PUBLIC_ROUTE_KEY 表示用于标记公开路由的元数据键。用作元数据的标识符，后续的逻辑（如守卫或拦截器）可以通过这个键来获取元数据。
export const ROLES_KEY = '__roles__'

// PublicRoute 用于标记路由是否为公开路由（不需要身份验证）。它依赖于 NestJS 中的 SetMetadata 函数来设置元数据
// > 默认值为 false，表示该路由不是公开的，需要身份验证。
// > 传递 true 时，则标记该路由为公开路由，不需要身份验证。
export function Roles(roles: RoleType[]): CustomDecorator {
  return SetMetadata(ROLES_KEY, roles)
}
