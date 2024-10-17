import { AppConfig, appRegToken, IAppConfig } from './app.config'
import { AuthConfig, authRegToken, IAuthConfig } from './auth.config'

import { DatabaseConfig, databaseRegToken, IDatabaseConfig } from './database.config'

export * from './app.config'
export * from './auth.config'
export * from './database.config'

export interface AllConfigType {
  [appRegToken]: IAppConfig
  [authRegToken]: IAuthConfig
  [databaseRegToken]: IDatabaseConfig
}
export type ConfigKeyPaths = RecordNamePaths<AllConfigType>

export default {
  AppConfig,
  AuthConfig,
  DatabaseConfig,
}
