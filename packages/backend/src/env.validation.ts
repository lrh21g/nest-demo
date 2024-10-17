import { plainToInstance } from 'class-transformer'
import { IsEnum, IsIP, IsPort, IsString, validateSync } from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

enum DatabaseType {
  Mysql = 'mysql',
  Postgres = 'postgres',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsIP()
  APP_HOST: string

  @IsPort()
  APP_PORT: string

  @IsEnum(DatabaseType)
  DB_TYPE: string

  @IsIP()
  DB_HOST: string

  @IsPort()
  DB_PORT: string

  @IsString()
  DB_USERNAME: string

  @IsString()
  DB_PASSWORD: string
}

export default function envValidation(config: Record<string, unknown>) {
  // plainToInstance 将普通（字面）对象转换为类（构造函数）对象，也适用于数组。
  // 此处，将 config（环境变量配置） 转换为 EnvironmentVariables 类实例，并开启隐式类型转换。
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      // enableImplicitConversion 设置为 true 类转换器将根据属性的类型信息，尝试将属性隐式转换为目标类型。
      enableImplicitConversion: true,
    },
  )
  // validateSync 对给定对象执行同步验证
  const errors = validateSync(validatedConfig, {
    // skipMissingProperties 设置为 true 时，将跳过验证对象中所有为空或未定义的属性。
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
