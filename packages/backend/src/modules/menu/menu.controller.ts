import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { flattenDeep } from 'lodash'

import { definePermission, getDefinePermissions, Perm, UUIDParam } from '~/common/decorators'
import { CreatorPipe, UpdaterPipe } from '~/common/pipes'
import { MenuDto, MenuQueryDto, MenuUpdateDto } from './dtos/menu.dto'
import { MenuTypeEnum } from './menu.constant'
import { MenuService } from './menu.service'

export const permissions = definePermission('system:menu', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const)

@ApiTags('System - 菜单权限模块')
@Controller('menus')
export class MenuController {
  constructor(
    private menuService: MenuService,
  ) {}

  @Get('permissions')
  @ApiOperation({ summary: '获取后端定义的所有权限集' })
  async getPermissions(): Promise<string[]> {
    return getDefinePermissions()
  }

  @Get()
  @ApiOperation({ summary: '获取所有菜单列表' })
  @Perm(permissions.LIST)
  async list(@Query() dto: MenuQueryDto) {
    return this.menuService.list(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单或权限信息' })
  @Perm(permissions.READ)
  async info(@UUIDParam('id') id: Uuid) {
    return this.menuService.getMenuItemAndParentInfo(id)
  }

  @Post()
  @ApiOperation({ summary: '新增菜单或权限' })
  @Perm(permissions.CREATE)
  async create(
    @Body(CreatorPipe) dto: MenuDto,
  ): Promise<void> {
    await this.menuService.check(dto)
    if (!dto.parentId)
      dto.parentId = null

    await this.menuService.create(dto)
    if (dto.type === MenuTypeEnum.PERMISSION) {
      // 如果是权限发生更改，则刷新所有在线用户的权限
      await this.menuService.refreshOnlineUserPerms()
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单或权限' })
  @Perm(permissions.UPDATE)
  async update(
    @UUIDParam('id') id: Uuid,
    @Body(UpdaterPipe) dto: MenuUpdateDto,
  ): Promise<void> {
    await this.menuService.check(dto)
    if (dto.parentId === -1 || !dto.parentId)
      dto.parentId = null

    await this.menuService.update(id, dto)
    if (dto.type === MenuTypeEnum.PERMISSION) {
      // 如果是权限发生更改，则刷新所有在线用户的权限
      await this.menuService.refreshOnlineUserPerms()
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单或权限' })
  @Perm(permissions.DELETE)
  async delete(@UUIDParam('id') id: Uuid): Promise<void> {
    if (await this.menuService.checkRoleByMenuId(id))
      throw new BadRequestException('该菜单存在关联角色，无法删除')

    // 如果有子目录，一并删除
    const childMenus = await this.menuService.findChildMenus(id)
    await this.menuService.deleteMenuItem(flattenDeep([id, childMenus]))
    // 刷新在线用户权限
    await this.menuService.refreshOnlineUserPerms()
  }
}
