import cluster from 'node:cluster'
import process from 'node:process'
import { HttpStatus, Logger, UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from './app.module'
import { LoggingInterceptor } from './common/interceptors'
import { ConfigKeyPaths } from './config'
import { isDev, isMainProcess } from './env'
import { setupSwagger } from './setup-swagger'
import { LoggerService } from './share/logger/logger.service'

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    {
      // 指定使用的日志记录器（使用 winston），当设置为 false 则关闭日志记录
      logger: LoggerService,
    },
  )

  const configService = app.get(ConfigService<ConfigKeyPaths>)
  const { port, host, globalPrefix } = configService.get(
    'app',
    {
      // 如果存在，'get' 方法将尝试根据 'ConfigService' 类级指定的类型参数（例如：ConfigService<Configuration>）自动推断属性类型。
      infer: true,
    },
  )

  // 为每个 HTTP 路由路径注册一个前缀
  app.setGlobalPrefix(globalPrefix)

  if (isDev) {
    app.useGlobalInterceptors(new LoggingInterceptor())
  }

  // 配置全局验证管道（ValidationPipe），用于在应用程序中全局启用请求数据的验证和转换
  app.useGlobalPipes(
    new ValidationPipe({
      // 启用自动转换功能。在接收到请求时，NestJS 会将请求的参数转换为对应 DTO（数据传输对象）中定义的类型。
      transform: true,
      // 启用白名单功能。表示只有在 DTO 中明确标记为有效字段的属性会被保留下来，未定义的字段会被移除。
      whitelist: true,
      transformOptions: {
        // 启用了隐式转换功能。在执行转换时可以自动地将数据类型进行转换。例如，将请求中的字符串 "123" 转换为数字 123。
        // enableImplicitConversion: true,
      },
      // 启用此选项，当请求中包含 DTO 中未定义的属性时，会抛出一个异常，拒绝请求。
      // forbidNonWhitelisted: true,
      // 当请求验证失败时，返回 HTTP 状态码 422 Unprocessable Entity，这表示请求的语法正确，但由于语义错误，服务器无法处理请求。
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      // 当验证失败时，立即停止验证，并返回第一个验证错误。
      stopAtFirstError: true,
      // 自定义异常工厂函数，用来处理验证错误并生成相应的异常。
      exceptionFactory: errors =>
        // UnprocessableEntityException 为 NestJS 提供的内置异常，表示 HTTP 状态码 422，表示请求格式正确，但因为数据本身有问题，无法处理。
        new UnprocessableEntityException(
          errors.map((e) => {
            // 对于每一个验证错误 e，提取错误约束（constraints）中的第一个规则，并返回对应的错误消息。只返回第一个错误消息。
            const rule = Object.keys(e.constraints!)[0]
            const msg = e.constraints![rule]
            return msg
          })[0],
        ),
    }),
  )

  setupSwagger(app, configService)

  await app.listen(
    port,
    host,
    async () => {
      // 根据操作系统和 IP 版本，返回应用程序正在监听的网址。以 IPv6 或 IPv4 的 IP 值返回
      const url = await app.getUrl()
      const { pid } = process
      // 如果进程是主进程，则为真。
      const isPrimaryProgress = cluster.isPrimary
      const progressPrefix = isPrimaryProgress ? 'P' : 'W'

      if (!isMainProcess)
        return

      const logger = new Logger('NestApplication')
      logger.log(`[${progressPrefix + pid}] Server running on ${url}`)
    },
  )

  return app
}

bootstrap()
