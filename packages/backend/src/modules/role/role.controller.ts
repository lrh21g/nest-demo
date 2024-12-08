import { BadRequestException, Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { definePermission, Perm, UUIDParam } from '~/common/decorators'
import { UpdaterPipe } from '~/common/pipes'
import { MenuService } from '../menu/menu.service'
import { RoleDto, RoleQueryDto, RoleUpdateDto } from './dtos/role.dto'
import { RoleService } from './role.service'

export const permissions = definePermission('system:role', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
})

@ApiTags('Role - 角色模块')
@Controller('roles')
export class RoleController {
  constructor(
    private roleService: RoleService,
    private menuService: MenuService,
  ) { }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  // @ApiResult({ type: [RoleEntity], isPage: true })
  @Perm(permissions.LIST)
  async list(@Query() dto: RoleQueryDto) {
    return this.roleService.list(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色信息' })
  // @ApiResult({ type: RoleInfo })
  @Perm(permissions.READ)
  async info(@UUIDParam('id') id: Uuid) {
    return this.roleService.info(id)
  }

  @Post()
  @ApiOperation({ summary: '新增角色' })
  @Perm(permissions.CREATE)
  async create(@Body() dto: RoleDto): Promise<void> {
    await this.roleService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @Perm(permissions.UPDATE)
  async update(@UUIDParam('id') id: Uuid, @Body(UpdaterPipe) dto: RoleUpdateDto): Promise<void> {
    await this.roleService.update(id, dto)
    await this.menuService.refreshOnlineUserPerms(false)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @Perm(permissions.DELETE)
  async delete(@UUIDParam('id') id: Uuid): Promise<void> {
    if (await this.roleService.checkUserByRoleId(id))
      throw new BadRequestException('该角色存在关联用户，无法删除')

    await this.roleService.delete(id)
    await this.menuService.refreshOnlineUserPerms(false)
  }
}
