import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Redis from 'ioredis'
import { concat, isEmpty, isNil, uniq } from 'lodash'
import { In, IsNull, Like, Not, Repository } from 'typeorm'

import { InjectRedis } from '~/common/decorators'
import { BusinessException } from '~/common/exceptions'
import { ErrorEnum, RedisKeys } from '~/constants'
import { deleteEmptyChildren, genAuthPermKey, genAuthTokenKey, generatorMenu, generatorRouters } from '~/utils'
import { RoleService } from '../role/role.service'
import { MenuDto, MenuQueryDto, MenuUpdateDto } from './dtos/menu.dto'
import { MenuEntity } from './menu.entity'

@Injectable()
export class MenuService {
  constructor(
    @InjectRedis() private redis: Redis,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
    private roleService: RoleService,
  ) {}

  async list({
    name,
    path,
    permission,
    component,
    status,
  }: MenuQueryDto): Promise<MenuEntity[]> {
    const menus = await this.menuRepository.find({
      where: {
        ...(name && { name: Like(`%${name}%`) }),
        ...(path && { path: Like(`%${path}%`) }),
        ...(permission && { permission: Like(`%${permission}%`) }),
        ...(component && { component: Like(`%${component}%`) }),
        ...(!isNil(status) ? { status } : null),
      },
      order: { orderNo: 'ASC' },
    })
    // 获取所有菜单以及权限
    const menuList = generatorMenu(menus)

    if (!isEmpty(menuList)) {
      deleteEmptyChildren(menuList)
      return menuList
    }

    // 如果生产树形结构为空，则返回原始菜单列表
    return menus
  }

  // 创建菜单
  async create(menu: MenuDto): Promise<void> {
    await this.menuRepository.save(menu)
  }

  // 更新菜单
  async update(id: Uuid, menu: MenuUpdateDto): Promise<void> {
    await this.menuRepository.update(id, menu)
  }

  // 根据用户Id，获取所有菜单项
  async getMenus(uid: Uuid) {
    // 根据用户id查找角色信息
    const roleIds = await this.roleService.getRoleIdsByUid(uid)
    // 初始化菜单数组
    let menus: MenuEntity[] = []

    // 如果没有角色，则返回一个空的菜单
    if (isEmpty(roleIds))
      return generatorRouters([])

    if (this.roleService.hasAdminRole(roleIds)) {
      // 如果用户具有管理员角色，获取所有菜单

      menus = await this.menuRepository.find({ order: { orderNo: 'ASC' } })
    }
    else {
      // 如果用户没有管理员角色，根据角色过滤菜单

      menus = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoinAndSelect('menu.roles', 'role')
        .andWhere('role.id IN (:...roleIds)', { roleIds })
        .orderBy('menu.order_no', 'ASC')
        .getMany()
    }

    const menuList = generatorRouters(menus)
    return menuList
  }

  // 检查菜单创建规则是否符合
  async check(dto: Partial<MenuDto>): Promise<void | never> {
    if (dto.type === 2 && !dto.parentId) {
      // 无法直接创建权限，必须有parent
      throw new BusinessException(ErrorEnum.PERMISSION_REQUIRES_PARENT)
    }
    if (dto.type === 1 && dto.parentId) {
      const parent = await this.getMenuItemInfo(dto.parentId)
      if (isEmpty(parent))
        throw new BusinessException(ErrorEnum.PARENT_MENU_NOT_FOUND)

      if (parent && parent.type === 1) {
        // 当前新增为菜单但父节点也为菜单时为非法操作
        throw new BusinessException(
          ErrorEnum.ILLEGAL_OPERATION_DIRECTORY_PARENT,
        )
      }
    }
  }

  // 查找当前菜单下的子菜单，目录以及菜单
  async findChildMenus(mid: Uuid): Promise<any> {
    const allMenus: any = []
    const menus = await this.menuRepository.findBy({ parentId: mid })
    // if (_.isEmpty(menus)) {
    //   return allMenus;
    // }
    // const childMenus: any = [];
    for (const menu of menus) {
      if (menu.type !== 2) {
        // 子目录下是菜单或目录，继续往下级查找
        const c = await this.findChildMenus(menu.id)
        allMenus.push(c)
      }
      allMenus.push(menu.id)
    }
    return allMenus
  }

  // 获取某个菜单的信息
  async getMenuItemInfo(mid: Uuid): Promise<MenuEntity> {
    const menu = await this.menuRepository.findOneBy({ id: mid })
    return menu
  }

  // 获取某个菜单以及关联的父菜单的信息
  async getMenuItemAndParentInfo(mid: Uuid) {
    const menu = await this.menuRepository.findOneBy({ id: mid })
    let parentMenu: MenuEntity | undefined
    if (menu && menu.parentId)
      parentMenu = await this.menuRepository.findOneBy({ id: menu.parentId })

    return { menu, parentMenu }
  }

  // 查找节点路由是否存在
  async findRouterExist(path: string): Promise<boolean> {
    const menus = await this.menuRepository.findOneBy({ path })
    return !isEmpty(menus)
  }

  // 获取当前用户id的所有权限
  async getPermissions(uid: Uuid): Promise<string[]> {
    const roleIds = await this.roleService.getRoleIdsByUid(uid)
    let permission: any[] = []
    let result: any = null
    if (this.roleService.hasAdminRole(roleIds)) {
      result = await this.menuRepository.findBy({
        permission: Not(IsNull()),
        type: In([1, 2]),
      })
    }
    else {
      if (isEmpty(roleIds))
        return permission

      result = await this.menuRepository
        .createQueryBuilder('menu')
        // 进行内连接操作（INNER JOIN ，在表中存在至少一个匹配时返回行），并将所有选择属性添加到 SELECT 中。
        // > 'menu.roles' 是 menu 实体中的 roles 关系字段，表示菜单与角色之间的关系。
        // > 'role' 是 roles 表的别名，表示连接后的角色表的引用。
        // andSelect 表示不仅会进行连接，还会选择 roles 表的数据，以便能够将角色信息加载到结果中。
        .innerJoinAndSelect('menu.roles', 'role')
        // andWhere 用于在查询中添加更多的条件
        // role.id IN (:...roleIds) 表示筛选角色 id 在指定的 roleIds 数组中。
        .andWhere('role.id IN (:...roleIds)', { roleIds })
        .andWhere('menu.type IN (1,2)')
        .andWhere('menu.permission IS NOT NULL')
        // getMany 表示查询所有符合条件的结果，并返回一个包含多个 menu 实体的数组。
        .getMany()
    }
    // isEmpty 用于判断数组、对象或字符串是否为空的工具函数。
    if (!isEmpty(result)) {
      result.forEach((e) => {
        if (e.permission)
          permission = concat(permission, e.permission.split(','))
      })
      // uniq 用于返回新的去重后的数组。
      permission = uniq(permission)
    }
    return permission
  }

  // 删除多项菜单
  async deleteMenuItem(mids: string[]): Promise<void> {
    await this.menuRepository.delete(mids)
  }

  // 刷新指定用户ID的权限
  async refreshPerms(id: Uuid): Promise<void> {
    const perms = await this.getPermissions(id)
    const online = await this.redis.get(genAuthTokenKey(id))
    if (online) {
      // 判断是否在线

      await this.redis.set(genAuthPermKey(id), JSON.stringify(perms))
    }
  }

  // 刷新所有在线用户的权限
  async refreshOnlineUserPerms(_isNoticeUser = true): Promise<void> {
    const onlineUids: string[] = await this.redis.keys(genAuthTokenKey('*'))
    if (onlineUids && onlineUids.length > 0) {
      const promiseArr = onlineUids
        .map(i => Number.parseInt(i.split(RedisKeys.AUTH_TOKEN_PREFIX)[1]))
        .filter(i => i)
        .map(async (id) => {
          const perms = await this.getPermissions(id)
          await this.redis.set(genAuthPermKey(id), JSON.stringify(perms))
          return id
        })
      await Promise.all(promiseArr)
    }
  }

  // 根据菜单ID查找是否有关联角色
  async checkRoleByMenuId(id: Uuid): Promise<boolean> {
    return !!(await this.menuRepository.findOne({
      where: {
        roles: { id },
      },
    }))
  }
}
