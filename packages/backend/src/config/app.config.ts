import { ConfigType, registerAs } from '@nestjs/config'

import { env, envNumber, envString } from '~/env'

export const appRegToken = 'app'

const globalPrefix = env('GLOBAL_PREFIX', 'api')
export const AppConfig = registerAs(
  appRegToken,
  () => ({
    host: env('APP_BACKEND_HOST', 'localhost'),
    port: envNumber('APP_BACKEND_PORT', 3000),
    baseUrl: env('APP_BASE_URL'),
    globalPrefix,
    logger: {
      level: env('APP_LOGGER_LEVEL'),
      maxSize: envString('APP_LOGGER_MAX_SIZE'),
      maxFiles: envString('APP_LOGGER_MAX_FILES'),
    },
  }),
)

export type IAppConfig = ConfigType<typeof AppConfig>
