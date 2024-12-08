// 无需登录即可访问
export const PUBLIC_KEY = '__public_key__'

// 需登录后才可访问，无需权限
export const ALLOW_ANON_KEY = '__allow_anon_permission_key__'

// 需登录后才访问，需权限
export const PERMISSION_KEY = '__permission_key__'

// 用户角色枚举
export enum AuthStrategy {
  PUBLIC = 'public',
  JWT = 'jwt',
}

export const Roles = {
  ADMIN: 'admin', // 管理员
  USER: 'user', // 普通用户
  // GUEST: 'guest', // 访客
}

export type Role = (typeof Roles)[keyof typeof Roles]
