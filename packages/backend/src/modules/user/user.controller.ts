import { Controller, Get, HttpCode, HttpStatus, Query, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResult, UUIDParam } from '~/common/decorators'
import { PageDto } from '~/common/dtos/page.dto'
import { UserDto } from './dtos/user.dto'
import { UsersPageOptionsDto } from './dtos/user-page-options.dto'
import { UserService } from './user.service'

@ApiTags('Users - 用户模块')
@Controller('users')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取所有用户信息' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: [UserDto], isPage: true })
  getUsers(
    // ValidationPipe 使用了 class-validator 包及其声明性验证装饰器。
    // ValidationPipe 提供了一种对所有传入的客户端有效负载强制执行验证规则的便捷方法，其中在每个模块的本地类或者 DTO 声明中使用简单的注释声明特定的规则。
    @Query(new ValidationPipe({ transform: true })) pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getUsers(pageOptionsDto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户信息' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: UserDto })
  getUser(
    @UUIDParam('id') userId: Uuid,
  ): Promise<UserDto> {
    return this.userService.getUser(userId)
  }
}
