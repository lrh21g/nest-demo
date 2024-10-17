import {
  IsPhoneNumber as isPhoneNumber,
  registerDecorator,
  ValidateIf,
  ValidationOptions,
} from 'class-validator'
import { isString } from 'lodash'

// IsNullable 装饰器用于属性值为 null 时，它将跳过其他验证；不为 null 时，则会继续进行验证。
// eg:
// class User {
//   @IsNullable()
//   @IsString()  // 只有在值不为null时，才会验证是否为字符串
//   name: string | null;
// }
export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  // ValidateIf （条件验证装饰器）用于在所提供的条件函数返回为 false 时，忽略属性上的其他验证器。使用被验证对象，必须返回布尔值。
  // _obj 为 被验证对象，value 为被验证对象的属性值，options 为验证时的配置选项
  // 检查 value 是否为 null，只有当值不为 null 时，才会进行其他的验证逻辑。
  return ValidateIf((_obj, value) => value !== null, options)
}

// IsUndefinable 装饰器用于属性值为 undefined 时，它将跳过其他验证；不为 undefined 时，则会继续进行验证。
export function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
  return ValidateIf((_obj, value) => value !== undefined, options)
}

// 验证字符串是否为临时键，要求以 'tmp/' 开头
export function IsTmpKey(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName) => {
    // 注册自定义验证装饰器
    registerDecorator({
      target: object.constructor, // 验证的目标对象
      propertyName: propertyName as string, // 验证的目标对象属性名称
      name: 'tmpKey', // 注册的验证名称
      options: validationOptions, // 验证器选项
      // 执行验证的验证器
      validator: {
        // 对给定值执行自定义验证时，调用的验证方法
        validate(value: string): boolean {
          return isString(value) && value.startsWith('tmp/')
        },
        // 验证失败时的默认信息
        defaultMessage(): string {
          return 'error.invalidTmpKey'
        },
      },
    })
  }
}

// 验证一个字符串值是否符合密码规则。
export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      propertyName: propertyName as string,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return /^[\d!#$%&*@A-Z^]*$/i.test(value)
        },
      },
    })
  }
}

// 验证一个字符串值是否是有效的电话号码。
export function IsPhoneNumber(
  validationOptions?: ValidationOptions & {
    region?: Parameters<typeof isPhoneNumber>[0]
  },
): PropertyDecorator {
  return isPhoneNumber(validationOptions?.region, {
    message: 'error.phoneNumber',
    ...validationOptions,
  })
}
