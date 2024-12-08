import path from 'node:path'
import process from 'node:process'

import { ConfigType, registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import dotenv from 'dotenv'
import { DataSource, DataSourceOptions } from 'typeorm'

import { ROOT_DIR } from '~/constants'
import { env, envBoolean, envNumber } from '~/env'
import { UserSubscriber } from '~/share/database/entity-subscribers/user-subscriber'
import { SnakeNamingStrategy } from '~/share/database/strategy/snake-naming.strategy'

import '~/boilerplate.polyfill'

dotenv.config({
  path: path.resolve(ROOT_DIR, `.env.${process.env.NODE_ENV || 'development'}`),
})

export const dataSourceOptions = {
  type: env('DB_TYPE'), // RDBMS 类型，数据库引擎
  host: env('DB_HOST'), // 数据库主机
  port: envNumber('DB_PORT'), // 数据库主机端口
  username: env('DB_USERNAME'), // 数据库用户名
  password: env('DB_PASSWORD'), // 数据库密码
  database: env('DB_DATABASE'), // 数据库名称
  // logging: env('DB_LOGGING'),
  namingStrategy: new SnakeNamingStrategy(), // 数据库中的表和列的命名策略

  // 是否在每次应用程序启动时自动创建数据库模式
  // TODO : 请谨慎使用此选项，不要在生产环境中使用，否则您可能会丢失生产数据。在调试和开发过程中，此选项非常有用。
  synchronize: envBoolean('DB_SYNCHRONIZE', false),

  // 为此数据源加载和使用的实体或实体模式，接受实体类、实体模式类和要从中加载的目录路径。目录支持 glob 模式。
  entities: [path.join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
  // 要为此数据源加载和使用的迁移。接受迁移类和要从中加载的目录路径。目录支持 glob 模式。
  migrations: [path.join(__dirname, '..', 'share', 'database', 'migrations', '*.{ts,js}')],
  // 要为此数据源加载和使用的订阅者。接受实体类和要从中加载的目录路径。目录支持 glob 模式。
  subscribers: [UserSubscriber],
} as TypeOrmModuleOptions as DataSourceOptions

export const databaseRegToken = 'database'
export const DatabaseConfig = registerAs(
  databaseRegToken,
  (): DataSourceOptions => dataSourceOptions,
)

export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
