import { Controller, Get, Req } from '@nestjs/common'
import { Request } from 'express'

import { Auth, AuthUser } from '~/common/decorators'
import { RoleType } from '~/constants'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'

@Controller('account')
@Auth([RoleType.USER])
export default class AccountController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('logout')
  async logout(
    @AuthUser() user: IAuthUser,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.clearLoginStatus(user, req.accessToken)
  }
}
