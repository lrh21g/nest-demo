import { Transform } from 'class-transformer'
import { parsePhoneNumber } from 'libphonenumber-js'
import { castArray } from 'lodash'

// 将属性值转化为数组
export function ToArray(): PropertyDecorator {
  // Transform 允许在对象转换为类实例（反序列化）或类实例转换为普通对象（序列化）时，使用自定义函数处理属性值。
  return Transform(
    (params): unknown[] => {
      const value = params.value

      if (!value) {
        return value
      }

      // _.castArray(1) => [1]
      // _.castArray() => []
      return castArray(value)
    },
    {
      toClassOnly: true, // 仅在普通对象转换为类实例（反序列化）时生效
    },
  )
}

// 将属性值转换为小写字母
// > 如果输入值不是数组，则将其转换为小写。
// > 如果输入值是数组，则对数组中的每个元素调用 toLowerCase() 方法。
export function ToLowerCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value

      if (!value) {
        return
      }

      if (!Array.isArray(value)) {
        return value.toLowerCase()
      }

      return value.map(v => v.toLowerCase())
    },
    {
      toClassOnly: true,
    },
  )
}

// 将属性值转换为大写字母。
// > 如果输入值不是数组，则将其转换为大写；
// > 如果输入值是数组，则对数组中的每个元素调用 toUpperCase() 方法。
export function ToUpperCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value

      if (!value) {
        return
      }

      if (!Array.isArray(value)) {
        return value.toUpperCase()
      }

      return value.map(v => v.toUpperCase())
    },
    {
      toClassOnly: true,
    },
  )
}

// 将字符串格式的电话号码解析为标准的电话号码格式。
export function PhoneNumberSerializer(): PropertyDecorator {
  // parsePhoneNumber 从字符串中解析电话号码。
  return Transform(params => parsePhoneNumber(params.value as string, 'CN').number)
}

// 将字符串 'true' 或 'false' 转换为布尔值 true 或 false。
export function ToBoolean(): PropertyDecorator {
  return Transform(
    (params) => {
      switch (params.value) {
        case 'true': {
          return true
        }

        case 'false': {
          return false
        }

        default: {
          return params.value
        }
      }
    },
    {
      toClassOnly: true,
    },
  )
}
