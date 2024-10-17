import { NotFoundException } from '@nestjs/common'

// 自定义 UserNotFoundException 异常类：用于处理用户未找到的异常场景
export class UserNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.userNotFound', error)
  }
}
