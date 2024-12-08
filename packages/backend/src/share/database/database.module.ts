import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, LoggerOptions } from 'typeorm'

import { UniqueConstraint } from '~/common/validators/unique.validator'
import { IDatabaseConfig } from '~/config'
import { env } from '~/env'
import { TypeORMLogger } from './typeorm-logger'

const providers = [UniqueConstraint]

@Module({
  imports: [
    // 使用 forRootAsync 允许在模块初始化时执行异步操作，如从数据库或其他外部服务加载配置信息。
    TypeOrmModule.forRootAsync({
      // useFactory 为工厂函数，允许动态创建提供程序。此处用于生成数据库的配置对象。
      useFactory: (configService: ConfigService) => {
        let loggerOptions: LoggerOptions = env('DB_LOGGING') as 'all'

        try {
          // 解析成 js 数组 ['error']
          loggerOptions = JSON.parse(loggerOptions)
        }
        catch {
          // ignore
        }

        return {
          ...configService.get<IDatabaseConfig>('database'),
          autoLoadEntities: true,
          logging: loggerOptions,
          logger: new TypeORMLogger(loggerOptions),
        }
      },
      // inject 为依赖注入。此处为将 ConfigService 将被注入到 useFactory 中，以便访问配置数据。
      inject: [ConfigService],
      // dataSourceFactory 用于处理 TypeORM 数据源的实例化。接收由 useFactory 返回的 options （从 ConfigService 获取的数据库配置选项）。
      dataSourceFactory: async (options) => {
        // 通过 new DataSource(options) 创建一个新的 TypeORM 数据源实例，调用 .initialize() 方法来异步初始化连接。
        const dataSource = await new DataSource(options)
        return dataSource.initialize()
      },
    }),
  ],
  providers,
  exports: providers,
})

export class DatabaseModule {}
