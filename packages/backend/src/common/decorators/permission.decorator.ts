import { applyDecorators, SetMetadata } from '@nestjs/common'
import { isPlainObject } from 'lodash'

import { PERMISSION_KEY } from '~/constants'

/**
 * 将数组 P 中的字符串值作为键，并且生成对应的值。每个值的格式为 "T:lowercase(K)"。
 *
 * @param {string} T 前缀，用于在每个值前添加一个字符串。
 * @param {string[]} P 只读字符串数组，其中每个元素都是一个字符串。
 * @returns {object} 对象，其中每个键都是数组 P 中的字符串，每个值都是 "T:lowercase(K)"。
 *
 * @example
 * TupleToObject<'prefix', ['foo', 'bar', 'baz']>
 * => { FOO: 'prefix:foo', BAR: 'prefix:bar', BAZ: 'prefix:baz' }
 */
type TupleToObject<T extends string, P extends ReadonlyArray<string>> = {
  // P[number] 表示数组 P 中的每个元素。
  // Uppercase<P[number]> 会把每个元素转换成大写字母，用作对象的键。
  // Lowercase<K> 会把每个键（即数组元素的字符串）转换为小写字母，用作值的部分。
  // ${T}:${Lowercase<K>} 其中 T 是前缀，K 是转换为大写后数组元素的字符串。
  [K in Uppercase<P[number]>]: `${T}:${Lowercase<K>}`
}

/**
 * 为对象 P 中每个值添加前缀 T，并返回新的对象类型。
 *
 * @param {string} T 前缀，用于在每个值前添加一个字符串。
 * @param {object} P 对象，其中每个键都是字符串，每个值都是字符串。
 * @returns {object} 新的对象类型，其中每个键都是对象 P 中的键，每个值都是 "T:P[K]"。
 *
 * @example
 * AddPrefixToObjectValue<'prefix', { foo: 'bar', baz: 'qux' }>;
 * => { foo: 'prefix:bar', baz: 'prefix:qux' }
 */
// Record<Keys, Type> 返回一个对象类型，参数 Keys 用作键名，参数 Type 用作键值类型。
type AddPrefixToObjectValue<T extends string, P extends Record<string, string>> = {
  // keyof P 表示 P 的每个键。
  // K extends string 是为了确保 P 中的键是字符串。
  // P[K] 获取对象 P 中每个键对应的值。
  // T:P[K] 将前缀 T 与原始值拼接，构成新的值。
  [K in keyof P]: K extends string ? `${T}:${P[K]}` : never
}

// 资源操作需要特定的权限
export function Perm(permission: string | string[]) {
  return applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
  )
}

/**
 * 注意：此举非必需
 * 保存通过 definePermission 定义的所有权限
 * 可用于前端开发人员开发阶段的 ts 类型提示，避免前端权限定义与后端定义不匹配
 */
let permissions: string[] = []

/**
 * 定义权限，同时收集所有被定义的权限
 *
 * - 通过对象形式定义, eg:
 * definePermission('app:health', { NETWORK: 'network' };
 * => { NETWORK: 'app:health:network' }
 *
 * - 通过字符串数组形式定义, eg:
 * definePermission('app:health', ['network']);
 * => { NETWORK: 'app:health:network' }
 */
export function definePermission<T extends string, U extends Record<string, string>>(modulePrefix: T, actionMap: U): AddPrefixToObjectValue<T, U>
export function definePermission<T extends string, U extends ReadonlyArray<string>>(modulePrefix: T, actions: U): TupleToObject<T, U>
export function definePermission(modulePrefix: string, actions) {
  if (isPlainObject(actions)) {
    // actions 为普通对象

    Object.entries(actions).forEach(([key, action]) => {
      actions[key] = `${modulePrefix}:${action}`
    })
    permissions = [...new Set([...permissions, ...Object.values<string>(actions)])]
    return actions
  }
  else if (Array.isArray(actions)) {
    // actions 为数组

    const permissionFormats = actions.map(action => `${modulePrefix}:${action}`)
    permissions = [...new Set([...permissions, ...permissionFormats])]

    return actions.reduce((prev, action) => {
      prev[action.toUpperCase()] = `${modulePrefix}:${action}`
      return prev
    }, {})
  }
}

/** 获取所有通过 definePermission 定义的权限 */
export const getDefinePermissions = () => permissions
