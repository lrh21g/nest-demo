import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { InjectRedis } from '~/common/decorators'
import { BusinessException } from '~/common/exceptions'
import { AppConfig, AuthConfig, IAppConfig, IAuthConfig } from '~/config'

import { ErrorCode } from '~/constants'
import { genAuthPVKey, genAuthTokenKey, genTokenBlacklistKey, validateHash } from '~/utils'

import { UserService } from '../user/user.service'
import { LoginPayloadDto } from './dtos/login-payload.dto'
import { TokenPayloadDto } from './dtos/token-payload.dto'
import { UserLoginDto } from './dtos/user-login.dto'
import { TokenService } from './token.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private userService: UserService,
    private tokenService: TokenService,
    @Inject(AuthConfig.KEY) private authConfig: IAuthConfig,
    @Inject(AppConfig.KEY) private appConfig: IAppConfig,
  ) {}

  // 登录
  async login(userLoginDto: UserLoginDto): Promise<LoginPayloadDto> {
    const userEntity = await this.userService.findOne({
      email: userLoginDto.email,
    })
    if (isEmpty(userEntity))
      throw new BusinessException(ErrorCode.INVALID_USERNAME_PASSWORD)

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      userEntity?.password,
    )
    if (!isPasswordValid) {
      throw new BusinessException(ErrorCode.INVALID_USERNAME_PASSWORD)
    }

    // 包含 access_token 和 refresh_token
    const token = await this.tokenService.generateAccessToken(userEntity.id, userEntity.role)

    await this.redis.set(genAuthTokenKey(userEntity.id), token.accessToken, 'EX', this.authConfig.expirationTime)

    // 设置密码版本号 当密码修改时，版本号+1
    await this.redis.set(genAuthPVKey(userEntity.id), 1)

    return new LoginPayloadDto(
      userEntity.toDto(),
      new TokenPayloadDto({
        expiresIn: this.authConfig.expirationTime,
        accessToken: token.accessToken,
      }),
    )
  }

  // 通过 userId 获取 redis 缓存密码版本号
  async getPasswordVersionByUserId(userId: Uuid): Promise<string> {
    return this.redis.get(genAuthPVKey(userId))
  }

  // 通过 userId 获取 redis 缓存 token
  async getTokenByUserId(userId: Uuid): Promise<string> {
    return this.redis.get(genAuthTokenKey(userId))
  }

  async clearLoginStatus(user: IAuthUser, accessToken: string): Promise<void> {
    const exp = user.exp ? (user.exp - Date.now() / 1000).toFixed(0) : this.authConfig.expirationTime

    await this.redis.set(genTokenBlacklistKey(accessToken), accessToken, 'EX', exp)

    if (this.appConfig.multiDeviceLogin)
      await this.tokenService.removeAccessToken(accessToken)
    else
      await this.userService.forbidden(user.userId, accessToken)
  }
}
