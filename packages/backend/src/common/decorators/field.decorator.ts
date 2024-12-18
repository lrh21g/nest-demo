import { applyDecorators } from '@nestjs/common'

import {
  ApiProperty, // 将类的属性暴露给 Swagger 文档生成工具的装饰器。它会将该属性的信息（类型、描述、是否必需等）加入到自动生成的 Swagger 文档中。
  ApiPropertyOptions, // @ApiProperty() 装饰器的配置选项，用于对文档生成进行进一步的自定义。它允许你指定更多属性的元数据，如字段的描述、是否必需、默认值、枚举值等。
} from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean, // 检数值是否为 Boolean
  IsDate, // 检查值是否已定义 (value !== undefined, value !== null)
  IsEmail, // 检查字符串是否为 email
  IsEnum, // 检查值是否为有效枚举
  IsInt,
  IsNotEmpty, // 检查值是否为整数
  IsNumber, // 检查值是否为 number
  IsPositive, // 检查值是否为正数（大于零）
  IsString, // 检查值是否为 string
  IsUrl, // 检查字符串是否为 URL
  IsUUID, // 检查字符串是否为 UUID （如果给定值不是字符串，则返回 false）
  Max, // 检查数值是否小于或等于允许的最大值
  MaxLength, // 检查字符串的长度是否大于给定的数字。
  Min, // 检查数值是否大于或等于允许的最小值
  MinLength, // 检查值是否与比较值不匹配 (!==)
  ValidateNested, // 如果对象包含嵌套对象，并且希望验证器也对它们进行验证。其中，嵌套对象必须是一个类的实例
} from 'class-validator'
import { isNumber } from 'lodash'

import {
  ApiEnumProperty,
  ApiUUIDProperty,
} from './property.decorator'
import {
  ToArray,
  ToBoolean,
  ToLowerCase,
  ToTrim,
  ToUpperCase,
} from './transform.decorator'
import {
  IsPassword,
  IsPhoneNumber,
  IsTmpKey as IsTemporaryKey,
  IsUsername,
  IsValidateIfEmpty,
} from './validator.decorator'

interface IFieldOptions {
  each?: boolean // 是否对数组中的每个项进行验证
  swagger?: boolean // 是否生成 swagger 文档
  nullable?: boolean // 是否允许为空
  groups?: string[]
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number
  maxLength?: number
  toLowerCase?: boolean
  toUpperCase?: boolean
}

interface INumberFieldOptions extends IFieldOptions {
  min?: number
  max?: number
  int?: boolean
  isPositive?: boolean
}

type IClassFieldOptions = IFieldOptions
type IBooleanFieldOptions = IFieldOptions
type IEnumFieldOptions = IFieldOptions

// 自定义属性装饰器，用于简化和统一在 NestJS 项目中对数据传输对象（DTO）或实体类属性的验证、转换和 Swagger 文档生成。
// 装饰器结合了 class-validator、class-transformer 和 @nestjs/swagger 的功能，提供了一个高效、可维护的方式来定义和管理类属性。
// 主要用于：
// 1. 验证：确保传入的数据符合预期的格式和约束（如类型、长度、枚举值等）。
// 2. 转换：在数据传输过程中自动转换数据格式（如字符串转布尔值、转换为数组等）。
// 3. 文档：自动生成 Swagger 文档，描述 API 的输入和输出模型。

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${options?.description ?? '$property'}不能为空`,
      }),
    )
  }

  if (options.each)
    decorators.push(ToArray())

  if (options.int) {
    decorators.push(
      IsInt({
        each: options.each,
        message: `${options?.description ?? '$property'}需为整数`,
      }),
    )
  }
  else {
    decorators.push(
      IsNumber({}, {
        each: options.each,
        message: `${options?.description ?? '$property'}需为数字`,
      }),
    )
  }

  if (typeof options.min === 'number') {
    decorators.push(
      Min(
        options.min,
        {
          each: options.each,
          message: `${options?.description ?? '$property'}最小为$constraint1`,
        },
      ),
    )
  }

  if (typeof options.max === 'number') {
    decorators.push(
      Max(
        options.max,
        {
          each: options.each,
          message: `${options?.description ?? '$property'}最大为$constraint1`,
        },
      ),
    )
  }

  if (options.isPositive) {
    decorators.push(
      IsPositive({
        each: options.each,
        message: `${options?.description ?? '$property'}需为大于零的正数`,
      }),
    )
  }

  if (options.swagger !== false)
    decorators.push(ApiProperty({ type: Number, ...options as ApiPropertyOptions }))

  return applyDecorators(...decorators)
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    NumberField({ required: false, ...options }),
  )
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => String),
    IsString({
      each: options.each,
      message: `${options?.description ?? '$property'}需为字符串`,
    }),
    ToTrim(),
  ]

  if (isNumber(options.minLength)) {
    decorators.push(
      MinLength(
        options.minLength,
        {
          each: options.each,
          message: `${options?.description ?? '$property'}最小长度为$constraint1`,
        },
      ),
    )
  }

  if (isNumber(options.maxLength)) {
    decorators.push(
      MaxLength(
        options.maxLength,
        {
          each: options.each,
          message: `${options?.description ?? '$property'}最大长度为$constraint1`,
        },
      ),
    )
  }

  if (options.toLowerCase)
    decorators.push(ToLowerCase())

  if (options.toUpperCase)
    decorators.push(ToUpperCase())

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${options?.description ?? '$property'}不能为空`,
      }),
    )
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: String,
        ...options as ApiPropertyOptions,
        isArray: options.each,
      }),
    )
  }

  return applyDecorators(...decorators)
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    StringField({ required: false, ...options }),
  )
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    ToBoolean(),
    IsBoolean({
      message: `${options?.description ?? '$property'}需为布尔值`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.swagger !== false)
    decorators.push(ApiProperty({ type: Boolean, ...options as ApiPropertyOptions }))

  return applyDecorators(...decorators)
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    BooleanField({ required: false, ...options }),
  )
}

export function DateField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => Date),
    IsDate({
      message: `${options?.description ?? '$property'}需为日期`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.swagger !== false)
    decorators.push(ApiProperty({ type: Date, ...options as ApiPropertyOptions }))

  return applyDecorators(...decorators)
}

export function DateFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    DateField({ ...options, required: false }),
  )
}

export function PhoneField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsPhoneNumber({ message: `${options?.description ?? '$property'}不符合格式要求` }),
    // PhoneNumberSerializer(),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.swagger !== false)
    decorators.push(ApiProperty({ type: String, ...options as ApiPropertyOptions }))

  return applyDecorators(...decorators)
}

export function PhoneFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    PhoneField({ required: false, ...options }),
  )
}

export function EmailField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField({ toLowerCase: true, ...options }),
    IsEmail({}, { message: `${options?.description ?? '$property'}不符合格式要求` }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${options?.description ?? '$property'}不能为空`,
      }),
    )
  }

  if (options.swagger !== false)
    decorators.push(ApiProperty({ type: String, ...options as ApiPropertyOptions }))

  return applyDecorators(...decorators)
}

export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    EmailField({ required: false, ...options }),
  )
}

export function UsernameField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField({ ...options, minLength: 4 }),
    IsUsername({ message: `${options?.description ?? '$property'}不符合格式要求` }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(
      IsNotEmpty({
        each: options.each,
        message: `${options?.description ?? '$property'}不能为空`,
      }),
    )
  }

  return applyDecorators(...decorators)
}

export function UsernameFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    UsernameField({ required: false, ...options }),
  )
}

export function PasswordField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField({ ...options, minLength: 6 }),
    IsPassword({ message: `${options?.description ?? '$property'}不符合格式要求` }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  return applyDecorators(...decorators)
}

export function PasswordFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    PasswordField({ required: false, ...options }),
  )
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    Type(() => String),
    IsUUID('4', {
      each: options.each,
      message: `${options?.description ?? '$property'}不符合格式要求`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.each) {
    decorators.push(ToArray())
  }

  if (options.swagger !== false) {
    decorators.push(ApiUUIDProperty(options))
  }

  return applyDecorators(...decorators)
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> &
    IFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    UUIDField({ required: false, ...options }),
  )
}

export function URLField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField(options),
    IsUrl({}, {
      each: true,
      message: `${options?.description ?? '$property'}不符合格式要求`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  return applyDecorators(...decorators)
}

export function URLFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    URLField({ required: false, ...options }),
  )
}

export function ClassField<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
): PropertyDecorator {
  const classValue = getClass()

  const decorators = [
    Type(() => classValue),
    ValidateNested({
      each: options.each,
      message: `${options?.description ?? '$property'}不符合要求`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        type: () => classValue,
        ...options as ApiPropertyOptions,
      }),
    )
  }

  return applyDecorators(...decorators)
}

export function ClassFieldOptional<TClass extends Constructor>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IClassFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    ClassField(getClass, { required: false, ...options }),
  )
}

export function TmpKeyField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    StringField(options),
    IsTemporaryKey({
      each: options.each,
      message: `${options?.description ?? '$property'}不符合格式要求`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({ type: String, ...options as ApiPropertyOptions, isArray: options.each }),
    )
  }

  return applyDecorators(...decorators)
}

export function TmpKeyFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    TmpKeyField({ required: false, ...options }),
  )
}

export function EnumField<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName' | 'isArray'> & IEnumFieldOptions = {},
): PropertyDecorator {
  const enumValue = getEnum()
  const decorators = [
    IsEnum(enumValue, {
      each: options.each,
      message: `${options?.description ?? '$property'}不符合要求`,
    }),
  ]

  if (options.required === false) {
    decorators.push(IsValidateIfEmpty())
  }
  else {
    decorators.push(IsNotEmpty({
      each: options.each,
      message: `${options?.description ?? '$property'}不能为空`,
    }))
  }

  if (options.each)
    decorators.push(ToArray())

  if (options.swagger !== false) {
    decorators.push(
      ApiEnumProperty(getEnum, { ...options, isArray: options.each }),
    )
  }

  return applyDecorators(...decorators)
}

export function EnumFieldOptional<TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> & IEnumFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    EnumField(getEnum, { required: false, ...options }),
  )
}
