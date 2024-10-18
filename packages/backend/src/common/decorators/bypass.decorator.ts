import { SetMetadata } from '@nestjs/common'

// 用作元数据的键，标识需要绕过基础返回格式的处理程序
export const BYPASS_KEY = '__bypass_key__'

// 用于标记某些处理程序（如控制器或路由处理函数），以便在不需要转换成基础返回格式时使用
export function Bypass() {
  // 调用 SetMetadata，并将 BYPASS_KEY 作为键，true 作为值设置元数据
  return SetMetadata(BYPASS_KEY, true)
}
