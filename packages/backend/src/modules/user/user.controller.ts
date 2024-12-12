import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseArrayPipe, Post, Put, Query, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResult, definePermission, Perm, UUIDParam } from '~/common/decorators'
import { Pagination } from '~/helper/paginate/pagination'
import { MenuService } from '../menu/menu.service'
import { UserDto, UserQueryDto, UserUpdateDto } from './dtos/user.dto'
import { UserPasswordDto } from './dtos/user-password.dto'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'

export const permissions = definePermission('system:user', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',

  PASSWORD_UPDATE: 'password:update',
  PASSWORD_RESET: 'pass:reset',
} as const)

@ApiTags('Users - 用户模块')
@Controller('users')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) { }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: [UserDto], isPage: true })
  @Perm(permissions.LIST)
  async list(
    // ValidationPipe 使用了 class-validator 包及其声明性验证装饰器。
    // ValidationPipe 提供了一种对所有传入的客户端有效负载强制执行验证规则的便捷方法，其中在每个模块的本地类或者 DTO 声明中使用简单的注释声明特定的规则。
    @Query(new ValidationPipe({ transform: true })) userQueryDto: UserQueryDto,
  ): Promise<Pagination<UserEntity>> {
    return this.userService.list(userQueryDto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户信息' })
  @HttpCode(HttpStatus.OK)
  @ApiResult({ type: UserDto })
  @Perm(permissions.READ)
  getUser(
    @UUIDParam('id') uid: Uuid,
  ): Promise<UserEntity> {
    return this.userService.info(uid)
  }

  @Post()
  @ApiOperation({ summary: '新增用户' })
  @Perm(permissions.CREATE)
  async create(@Body() dto: UserDto): Promise<void> {
    await this.userService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @Perm(permissions.UPDATE)
  async update(
    @UUIDParam('id') uid: Uuid,
    @Body() dto: UserUpdateDto,
  ): Promise<void> {
    await this.userService.update(uid, dto)
    await this.menuService.refreshPerms(uid)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  // @ApiParam({ name: 'id', type: String, schema: { oneOf: [{ type: 'string' }, { type: 'number' }] } })
  @Perm(permissions.DELETE)
  async delete(
    @Param('id', new ParseArrayPipe({ items: String, separator: ',' })) ids: Uuid[],
  ): Promise<void> {
    await this.userService.delete(ids)
    await this.userService.multiForbidden(ids)
  }

  @Post(':id/password')
  @ApiOperation({ summary: '更改用户密码' })
  @Perm(permissions.PASSWORD_UPDATE)
  async password(
    @UUIDParam('id') uid: Uuid,
    @Body() dto: UserPasswordDto,
  ): Promise<void> {
    await this.userService.forceUpdatePassword(uid, dto.password)
  }
}
