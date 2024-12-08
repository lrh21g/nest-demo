import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import dayjs from 'dayjs'
import Redis from 'ioredis'

import { InjectRedis } from '~/common/decorators'
import { AuthConfig, IAuthConfig } from '~/config'
import { generateUUID, genOnlineUserKey } from '~/utils'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { AccessTokenEntity } from './entities/access-token.entity'
import { RefreshTokenEntity } from './entities/refresh-token.entity'

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    // @Inject(forwardRef(() => UserService)) private userService: UserService,
    private userService: UserService,
    @InjectRedis() private redis: Redis,
    @Inject(AuthConfig.KEY) private authConfig: IAuthConfig,
  ) {}

  generateJwtSign(payload: any) {
    const jwtSign = this.jwtService.sign(payload)

    return jwtSign
  }

  async generateAccessToken(uid: Uuid, roles: string[] = []) {
    const payload: IAuthUser = {
      uid,
      pv: 1,
      roles,
    }
    // 调用 jwtService 提供的 signAsync 方法，对 payload 数据进行加密签名生成 JWT 令牌。用于用户认证或授权。
    const jwtSign = await this.jwtService.signAsync(payload)

    const accessToken = new AccessTokenEntity()
    accessToken.value = jwtSign
    accessToken.user = { id: uid } as UserEntity
    accessToken.expiredAt = dayjs()
      .add(this.authConfig.expirationTime, 'second')
      .toDate()

    await accessToken.save()
    const refreshToken = await this.generateRefreshToken(accessToken, dayjs())

    return {
      accessToken: jwtSign,
      refreshToken,
    }
  }

  async generateRefreshToken(
    accessToken: AccessTokenEntity,
    now: dayjs.Dayjs,
  ): Promise<string> {
    const refreshTokenResponse = {
      uuid: generateUUID(),
    }

    const refreshTokenSign = await this.jwtService.signAsync(
      refreshTokenResponse,
      {
        expiresIn: this.authConfig.refreshExpirationTime,
      },
    )

    const refreshToken = new RefreshTokenEntity()
    refreshToken.value = refreshTokenSign
    refreshToken.expiredAt = now
      .add(this.authConfig.refreshExpirationTime, 'second')
      .toDate()
    refreshToken.accessToken = accessToken

    await refreshToken.save()

    return refreshTokenSign
  }

  async refreshToken(accessToken: AccessTokenEntity) {
    const { user, refreshToken } = accessToken

    if (refreshToken) {
      const now = dayjs()
      // 判断 refreshToken 是否过期
      if (now.isAfter(refreshToken.expiredAt))
        return null

      const role = await this.userService.findOne({
        id: user.id,
      })[0]

      // 如果没过期，则生成新的 access_token 和 refresh_token
      const token = await this.generateAccessToken(user.id, role)

      await accessToken.remove()
      return token
    }
    return null
  }

  async checkAccessToken(value: string) {
    let isValid = false
    try {
      await this.verifyAccessToken(value)
      const res = await AccessTokenEntity.findOne({
        // 查询条件
        // 在 AccessTokenEntity 中查找 value 字段与传入的 value 变量匹配的记录
        where: { value },
        // 用于指定需要关联查询的其他实体
        // user 和 refreshToken 是与 AccessTokenEntity 相关联的实体，意味着查询结果会包含这些关联的用户信息和刷新令牌信息。
        relations: ['user', 'refreshToken'],
        // 启用查询缓存。如果之前有相同的查询结果，ORM 可以直接从缓存中返回，而无需再次访问数据库。
        cache: true,
      })
      isValid = Boolean(res)
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (err) {}

    return isValid
  }

  async verifyAccessToken(token: string): Promise<IAuthUser> {
    return this.jwtService.verifyAsync(token)
  }

  async removeAccessToken(value: string) {
    const accessToken = await AccessTokenEntity.findOne({
      where: { value },
    })
    if (accessToken) {
      this.redis.del(genOnlineUserKey(accessToken.id))
      await accessToken.remove()
    }
  }

  async removeRefreshToken(value: string) {
    const refreshToken = await RefreshTokenEntity.findOne({
      where: { value },
      relations: ['accessToken'],
    })
    if (refreshToken) {
      if (refreshToken.accessToken)
        this.redis.del(genOnlineUserKey(refreshToken.accessToken.id))
      await refreshToken.accessToken.remove()
      await refreshToken.remove()
    }
  }
}
