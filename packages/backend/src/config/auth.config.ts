import { ConfigType, registerAs } from '@nestjs/config'

import { env, envNumber } from '~/env'

export const authRegToken = 'auth'
export const AuthConfig = registerAs(
  authRegToken,
  () => ({
    privateKey: env('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
    publicKey: env('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
    expirationTime: envNumber('JWT_EXPIRATION_TIME'),
  }),
)
export type IAuthConfig = ConfigType<typeof AuthConfig>
