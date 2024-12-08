import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { InjectRedis } from '~/common/decorators'
import { BusinessException } from '~/common/exceptions'
import { AppConfig, AuthConfig, IAppConfig, IAuthConfig } from '~/config'
import { ErrorEnum } from '~/constants'
import { genAuthPermKey, genAuthPVKey, genAuthTokenKey, genTokenBlacklistKey, validateHash } from '~/utils'
import { MenuService } from '../menu/menu.service'
import { RoleService } from '../role/role.service'
import { UserService } from '../user/user.service'
import { LoginResponse } from './dtos/login-response'
import { TokenResponse } from './dtos/token-response'
import { UserLoginDto } from './dtos/user-login.dto'
import { TokenService } from './token.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private userService: UserService,
    private tokenService: TokenService,
    private menuService: MenuService,
    private roleService: RoleService,
    @Inject(AuthConfig.KEY) private authConfig: IAuthConfig,
    @Inject(AppConfig.KEY) private appConfig: IAppConfig,
  ) {}

  // 登录
  async login(userLoginDto: UserLoginDto): Promise<LoginResponse> {
    const user = await this.userService.findUserByUserName(userLoginDto.username)
    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD)

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user?.password,
    )
    if (!isPasswordValid) {
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD)
    }

    const roleIds = await this.roleService.getRoleIdsByUid(user.id)

    const roles = await this.roleService.getRoleValues(roleIds)

    // 包含 access_token 和 refresh_token
    const token = await this.tokenService.generateAccessToken(user.id, roles)

    await this.redis.set(genAuthTokenKey(user.id), token.accessToken, 'EX', this.authConfig.expirationTime)

    // 设置密码版本号 当密码修改时，版本号+1
    await this.redis.set(genAuthPVKey(user.id), 1)

    return new LoginResponse(
      user,
      new TokenResponse({
        expiresIn: this.authConfig.expirationTime,
        accessToken: token.accessToken,
      }),
    )
  }

  // 重置密码
  async resetPassword(username: string, password: string) {
    const user = await this.userService.findUserByUserName(username)

    await this.userService.forceUpdatePassword(user.id, password)
  }

  // 通过 uid 获取 redis 缓存密码版本号
  async getPasswordVersionByUid(uid: Uuid): Promise<string> {
    return this.redis.get(genAuthPVKey(uid))
  }

  // 通过 uid 获取 redis 缓存 token
  async getTokenByUid(uid: Uuid): Promise<string> {
    return this.redis.get(genAuthTokenKey(uid))
  }

  async clearLoginStatus(user: IAuthUser, accessToken: string): Promise<void> {
    const exp = user.exp ? (user.exp - Date.now() / 1000).toFixed(0) : this.authConfig.expirationTime

    await this.redis.set(genTokenBlacklistKey(accessToken), accessToken, 'EX', exp)

    if (this.appConfig.multiDeviceLogin)
      await this.tokenService.removeAccessToken(accessToken)
    else
      await this.userService.forbidden(user.uid, accessToken)
  }

  // 根据用户id获取菜单列表
  async getMenus(uid: Uuid) {
    return this.menuService.getMenus(uid)
  }

  // 获取当前用户id的所有权限
  async getPermissions(uid: Uuid): Promise<string[]> {
    return this.menuService.getPermissions(uid)
  }

  async getPermissionsCache(uid: Uuid): Promise<string[]> {
    const permissionString = await this.redis.get(genAuthPermKey(uid))
    return permissionString ? JSON.parse(permissionString) : []
  }

  async setPermissionsCache(uid: Uuid, permissions: string[]): Promise<void> {
    await this.redis.set(genAuthPermKey(uid), JSON.stringify(permissions))
  }
}
