import path from 'node:path'
import process from 'node:process'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClsModule } from 'nestjs-cls'
import { DataSource } from 'typeorm'

import config from './config'
import { ROOT_DIR } from './constants'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'

import './boilerplate.polyfill'

const envFilePath = path.resolve(ROOT_DIR, `.env.${process.env.NODE_ENV || 'development'}`)

@Module({
  imports: [
    // 使用 forRoot 在应用启动时进行一次性的初始化配置。适用于状态管理、数据库连接、配置管理等需要全局共享的服务或配置。
    ConfigModule.forRoot({
      // 设置为全局模块，其他模块都可以直接注入配置服务。
      isGlobal: true,
      // 一个环境变量的值可以作为一个变量在另一个环境变量中使用。
      expandVariables: true,
      // 加载环境变量文件的路径。
      envFilePath,
      // 用于验证环境变量的自定义函数。如果函数中出现异常，应用程序将无法启动。
      // validate: envValidation,
      // 加载的自定义配置文件数组。
      load: [...Object.values(config)],
    }),
    // 使用 forRootAsync 允许在模块初始化时执行异步操作，如从数据库或其他外部服务加载配置信息。
    TypeOrmModule.forRootAsync({
      // useFactory 为工厂函数，允许动态创建提供程序。此处用于生成数据库的配置对象。
      useFactory: (configService: ConfigService) => {
        return configService.get('database')
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
    // 使用 nestjs-cls ClsModule 配置 NestJS 项目中的上下文状态管理
    ClsModule.forRoot({
      global: true,
      // 中间件配置
      middleware: {
        mount: true, // 是否将中间件加载到每个路由
      },
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
