import { CustomDecorator, SetMetadata } from '@nestjs/common'

// PUBLIC_ROUTE_KEY 表示用于标记公开路由的元数据键。用作元数据的标识符，后续的逻辑（如守卫或拦截器）可以通过这个键来获取元数据。
export const PUBLIC_ROUTE_KEY = 'public_route'

// PublicRoute 用于标记路由是否为公开路由（不需要身份验证）。它依赖于 NestJS 中的 SetMetadata 函数来设置元数据
// > 默认值为 false，表示该路由不是公开的，需要身份验证。
// > 传递 true 时，则标记该路由为公开路由，不需要身份验证。
export function PublicRoute(isPublic = false): CustomDecorator {
  return SetMetadata(PUBLIC_ROUTE_KEY, isPublic)
}
