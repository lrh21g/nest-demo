import { Controller, Get, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { Request } from 'express'
import { Auth, AuthUser } from '~/common/decorators'
import { RoleType } from '~/constants'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'

@ApiTags('Account - 用户账户模块')
@Controller('account')
@Auth([RoleType.USER])
export default class AccountController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) { }

  @Get('logout')
  @ApiOperation({ summary: '退出登录' })
  async logout(
    @AuthUser() user: IAuthUser,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.clearLoginStatus(user, req.accessToken)
  }
}
