import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiResult, Auth } from '~/common/decorators'
import { RoleType } from '~/constants'
import { UserDto } from '../user/dtos/user.dto'

import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { LoginPayloadDto } from './dtos/login-payload.dto'
import { UserLoginDto } from './dtos/user-login.dto'
import { UserRegisterDto } from './dtos/user-register.dto'

@ApiTags('Auth - 认证模块')
@Auth([RoleType.USER, RoleType.ADMIN], { public: true })
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: '注册' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: UserDto })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserDto> {
    const createUser = await this.userService.register(userRegisterDto)

    return createUser.toDto({
      isActive: true,
    })
  }

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: LoginPayloadDto })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginPayloadDto> {
    return await this.authService.login(userLoginDto)
  }
}
