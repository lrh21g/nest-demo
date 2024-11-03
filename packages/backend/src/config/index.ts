import { AppConfig, appRegToken, IAppConfig } from './app.config'
import { AuthConfig, authRegToken, IAuthConfig } from './auth.config'
import { DatabaseConfig, databaseRegToken, IDatabaseConfig } from './database.config'
import { IRedisConfig, RedisConfig, redisRegToken } from './redis.config'

export * from './app.config'
export * from './auth.config'
export * from './database.config'
export * from './redis.config'

// 定义了一个对象类型，键为注册令牌，值为相应的配置接口类型。
// 通过这种方式，AllConfigType 将所有配置的结构整合在一起，方便进行类型检查和使用。
export interface AllConfigType {
  [appRegToken]: IAppConfig
  [authRegToken]: IAuthConfig
  [databaseRegToken]: IDatabaseConfig
  [redisRegToken]: IRedisConfig
}

// RecordNamePaths 映射类型工具，用于生成根据 AllConfigType 中的键生成的路径类型。
export type ConfigKeyPaths = RecordNamePaths<AllConfigType>

export default {
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  RedisConfig,
}
