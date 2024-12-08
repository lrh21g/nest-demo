import { HttpException, HttpStatus } from '@nestjs/common'

import { ErrorEnum, RESPONSE_SUCCESS_CODE } from '~/constants'

// 自定义的业务异常类 BusinessException，继承自 NestJS 的 HttpException
// 用于在业务逻辑中抛出自定义的异常，并提供了灵活的错误信息和状态码处理机制
export class BusinessException extends HttpException {
  private errorCode: number

  constructor(error: ErrorEnum | string) {
    // 如果是非 ErrorEnum
    if (!error.includes(':')) {
      super(
        // 通过 HttpException.createBody() 方法创建一个包含 code 和 message 的响应体
        // > code 为 RESPONSE_SUCCESS_CODE
        // > message 为传入的 error 字符串。
        HttpException.createBody({
          code: RESPONSE_SUCCESS_CODE,
          message: error,
        }),
        HttpStatus.OK,
      )
      this.errorCode = RESPONSE_SUCCESS_CODE
      return
    }

    // 使用 split(':') 将字符串拆分为错误码 code 和错误信息 message
    const [code, message] = error.split(':')
    super(
      // 通过 HttpException.createBody() 创建包含 code 和 message 的响应体，并且同样设置状态码为 HttpStatus.OK
      HttpException.createBody({
        code,
        message,
      }),
      HttpStatus.OK,
    )
    this.errorCode = Number(code)
  }

  // 用于获取当前业务异常的错误码，返回 errorCode
  getErrorCode(): number {
    return this.errorCode
  }
}

export { BusinessException as BizException }
