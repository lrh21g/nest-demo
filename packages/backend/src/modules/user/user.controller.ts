import { Controller, Get, HttpCode, HttpStatus, Query, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Auth, UUIDParam } from '~/common/decorators'
import { PageDto } from '~/common/dtos/page.dto'
import { RoleType } from '~/constants'
import { UserDto } from './dtos/user.dto'
import { UsersPageOptionsDto } from './dtos/user-page-options.dto'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  getUsers(
    // ValidationPipe 使用了 class-validator 包及其声明性验证装饰器。
    // ValidationPipe 提供了一种对所有传入的客户端有效负载强制执行验证规则的便捷方法，其中在每个模块的本地类或者 DTO 声明中使用简单的注释声明特定的规则。
    @Query(new ValidationPipe({ transform: true })) pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getUsers(pageOptionsDto)
  }

  @Get(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  getUser(
    @UUIDParam('id') userId: Uuid,
  ): Promise<UserDto> {
    return this.userService.getUser(userId)
  }
}
