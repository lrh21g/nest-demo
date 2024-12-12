import {
  NotAcceptableException,
  Param,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common'
import { Type } from '@nestjs/common/interfaces'
import { AdminIdPipe } from '../pipes'

// UUIDParam 用于验证传入的 URL 参数是否是有效的 UUID（版本4）。
export function UUIDParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  // 通过 @Param 装饰器来处理指定的 property（URL 参数），并使用 ParseUUIDPipe 验证该参数是否是版本 4 的 UUID。如果需要，还可以附加其他管道处理参数。
  return Param(
    property,
    new ParseUUIDPipe({
      version: '4',
      exceptionFactory: () => { throw new NotAcceptableException('id 格式不正确') },
    }),
    ...pipes,
  )
}

export function AdminIdParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(
    property,
    new AdminIdPipe(),
    ...pipes,
  )
}
