import { CustomDecorator, SetMetadata } from '@nestjs/common'
import { PUBLIC_KEY } from '~/constants'

// Public 用于标记路由是否为公开路由（不需要身份验证）。它依赖于 NestJS 中的 SetMetadata 函数来设置元数据
// > 默认值为 false，表示该路由不是公开的，需要身份验证。
// > 传递 true 时，则标记该路由为公开路由，不需要身份验证。
export function Public(isPublic = true): CustomDecorator {
  return SetMetadata(PUBLIC_KEY, isPublic)
}
