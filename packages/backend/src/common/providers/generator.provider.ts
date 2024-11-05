import { v1 as uuid } from 'uuid'

// GeneratorProvider 类用于提供生成 UUID、验证码、密码和随机字符串的工具方法。
export class GeneratorProvider {
  // 使用了 uuid 库的 v1 方法来生成 UUID（Universally Unique Identifier），这是一个基于时间的唯一标识符。
  static uuid(): string {
    return uuid()
  }

  // 用于生成一个 4 位数的验证码
  static generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // 用于生成一个随机密码
  static generatePassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = lowercase.toUpperCase()
    const numbers = '0123456789'

    let text = ''

    for (let i = 0; i < 4; i++) {
      text += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
      text += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
      text += numbers.charAt(Math.floor(Math.random() * numbers.length))
    }

    return text
  }

  // 用于生成一个指定长度的随机字符串
  static generateRandomString(length: number): string {
    return Math.random()
      .toString(36) // 生成一个基于 36 进制（包含数字 0-9 和字母 a-z）的随机数字符串
      .replaceAll(/[^\dA-Z]+/gi, '') // 过滤掉字符串中的非字母和非数字字符，只保留数字和字母
      .slice(0, Math.max(0, length)) // 截取生成字符串的前 length 个字符
  }
}
