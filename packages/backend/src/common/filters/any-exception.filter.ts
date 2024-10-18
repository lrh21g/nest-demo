import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'
import { ErrorCode } from '~/constants'
import { isDev } from '~/env'
import { BusinessException } from '../exceptions'

interface myError {
  readonly status: number
  readonly statusCode?: number
  readonly message?: string
}

// 自定义异常过滤器的方法，用于捕获 NestJS 应用中的异常，并进行处理。
// 它主要用于处理不同类型的异常并返回合适的 HTTP 响应
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  // 核心方法，用于捕获和处理所有异常。
  // > exception: 发生的异常对象。
  // > host: ArgumentsHost 对象，提供访问请求和响应上下文的方法。
  catch(exception: unknown, host: ArgumentsHost) {
    // 对 HTTP 请求和响应的访问，通过 switchToHttp() 获取上下文
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const url = request.url
    // 获取 HTTP 状态码
    const status = this.getStatus(exception)
    // 提取出的错误信息
    let message = this.getErrorMessage(exception)

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR
      && !(exception instanceof BusinessException)
    ) {
      // 如果是内部服务器错误（500），并且异常不是 BusinessException，记录错误日志
      this.logger.error(exception)

      // 生产环境下，隐藏错误信息
      if (!isDev)
        message = ErrorCode.SERVER_ERROR?.split(':')[1]
    }
    else {
      // 如果不是 500 错误，记录警告日志，并输出请求的路径和错误信息
      this.logger.warn(
        `错误信息：(${status}) ${message} Path: ${decodeURI(url)}`,
      )
    }

    const apiErrorCode = exception instanceof BusinessException ? exception.getErrorCode() : status

    // 返回基础响应结果
    const resBody: IBaseResponse = {
      code: apiErrorCode,
      message,
      data: null,
    }

    response.status(status).send(resBody)
  }

  // 根据不同的异常类型，返回适当的 HTTP 状态码
  getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      // 如果是 HttpException，直接返回其状态码
      return exception.getStatus()
    }
    else if (exception instanceof QueryFailedError) {
      // 如果是 QueryFailedError（数据库错误），返回 500 状态码
      return HttpStatus.INTERNAL_SERVER_ERROR
    }
    else {
      // 如果其他异常，优先返回自定义的 status 或 statusCode，否则默认返回 500
      return (exception as myError)?.status
        ?? (exception as myError)?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR
    }
  }

  // 根据异常类型获取错误消息
  getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException || exception instanceof QueryFailedError) {
      // 对于 HttpException 或 QueryFailedError，直接返回其自带的 message
      return exception.message
    }
    else {
      // 对于其他类型的异常，尝试解析 response.message 或自定义 myError 中的 message，如果都不存在，则直接将异常对象字符串化作为消息
      return (exception as any)?.response?.message ?? (exception as myError)?.message ?? `${exception}`
    }
  }
}
