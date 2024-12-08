import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiResult, Public } from '~/common/decorators'
import { PublicGuard } from '~/common/guards/public.guard'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { LoginResponse, LoginResponseDto } from './dtos/login-response'
import { UserLoginDto } from './dtos/user-login.dto'
import { UserRegisterDto } from './dtos/user-register.dto'

@ApiTags('Auth - 认证模块')
@UseGuards(PublicGuard)
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: '注册' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: UserEntity })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserEntity> {
    const user = await this.userService.register(userRegisterDto)

    return user
  }

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: LoginResponseDto })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
    @Headers('user-agent') _ua: string,
  ): Promise<LoginResponse> {
    return await this.authService.login(userLoginDto)
  }
}
