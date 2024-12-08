import path from 'node:path'
import process from 'node:process'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { Request } from 'express'
import { ClsModule } from 'nestjs-cls'

import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RbacGuard } from './common/guards/rbac.guard'
import { TimeoutInterceptor, TransformInterceptor } from './common/interceptors'
import config from './config'
import { ROOT_DIR } from './constants'
import { AuthModule } from './modules/auth/auth.module'
import { RoleModule } from './modules/role/role.module'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from './share/database/database.module'
import { RedisModule } from './share/redis/redis.module'
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
    // 使用 nestjs-cls ClsModule 配置 NestJS 项目中的上下文状态管理
    ClsModule.forRoot({
      global: true,
      // 中间件配置
      middleware: {
        mount: true, // 是否将中间件加载到每个路由
      },
      interceptor: {
        mount: true,
        setup: (cls, context) => {
          const request = context.switchToHttp().getRequest<Request<{ query: { uid?: string } }>>()
          if (request.query?.uid && request.body) {
            // 供自定义参数验证器(UniqueConstraint)使用
            cls.set('operateId', request.query.uid)
          }
        },
      },
    }),
    DatabaseModule,
    RedisModule,
    UserModule,
    AuthModule,
    RoleModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useFactory: () => new TimeoutInterceptor(15 * 1000) },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
  ],
})
export class AppModule {}
