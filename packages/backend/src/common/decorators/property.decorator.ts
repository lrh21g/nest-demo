import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { getVariableName } from '~/utils'

// 通过自定义函数封装来简化 Swagger API 文档中 UUID 和 Enum 类型的属性描述。

// ApiUUIDProperty 用于定义具有 UUID 格式的属性，且该属性可以是单个字符串或数组。
// 通过封装 ApiProperty 装饰器，自动将字段类型定义为 UUID 格式，并根据选项决定是数组还是单个字符串。
export function ApiUUIDProperty(
  // 可以传入除 type 和 format 之外的 ApiPropertyOptions，并且还可以传入 each，表示该属性是否为数组。
  options: Omit<ApiPropertyOptions, 'type' | 'format'> & Partial<{ each: boolean }> = {},
): PropertyDecorator {
  return ApiProperty({
    type: options.each ? [String] : String, // 根据是否为数组，决定是单个 UUID 还是数组
    format: 'uuid', // 设置字段的格式为 UUID
    isArray: options.each, // 根据传入的 each 值，设置 isArray
    ...options, // 合并其他传入的选项
  })
}

// ApiEnumProperty 用于定义枚举类型的属性。
// 通过封装 ApiProperty 装饰器，自动提取枚举值并将其应用到 Swagger 文档中，同时提供一个 enumName 来命名该枚举类型。
export function ApiEnumProperty<TEnum>(
  getEnum: () => TEnum,
  // 可以传入除 type 之外的 ApiPropertyOptions，并且还可以传入 each，表示该属性是否为数组。
  options: Omit<ApiPropertyOptions, 'type'> & { each?: boolean } = {},
): PropertyDecorator {
  const enumValue = getEnum() as any

  return ApiProperty({
    type: 'enum', // 设置字段的格式为 uuid
    // throw error during the compilation of swagger
    // isArray: options.each,
    enum: enumValue, // 将枚举值传递给 Swagger
    enumName: getVariableName(getEnum), // 提取枚举的名称并应用于 Swagger
    ...options, // 合并其他传入的选项
  })
}
