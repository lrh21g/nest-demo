import cluster from 'node:cluster'
import process from 'node:process'
import { Logger } from '@nestjs/common'
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
