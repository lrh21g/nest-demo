import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'

import { Auth } from '~/common/decorators'
import { RoleType } from '~/constants'
import { UserDto } from '../user/dtos/user.dto'

import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { LoginPayloadDto } from './dtos/login-payload.dto'
import { UserLoginDto } from './dtos/user-login.dto'
import { UserRegisterDto } from './dtos/user-register.dto'

@Controller('auth')
@Auth([RoleType.USER, RoleType.ADMIN], { public: true })
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: 'Successfully Registered' })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserDto> {
    const createUser = await this.userService.register(userRegisterDto)

    return createUser.toDto({
      isActive: true,
    })
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginPayloadDto> {
    return await this.authService.login(userLoginDto)
  }
}
