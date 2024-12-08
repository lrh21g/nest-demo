import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { isEmpty, isNil } from 'lodash'
import { EntityManager, In, Like, Repository } from 'typeorm'

import { ROOT_ROLE_ID } from '~/constants'
import { paginate } from '~/helper/paginate'
import { Pagination } from '~/helper/paginate/pagination'
import { MenuEntity } from '../menu/menu.entity'
import { RoleDto, RoleQueryDto, RoleResponse, RoleUpdateDto } from './dtos/role.dto'
import { RoleAllPageOptionsDto } from './dtos/role-page-options.dto'
import { RoleEntity } from './role.entity'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  // 查找所有角色
  async findAll(
    { page, pageSize }: RoleAllPageOptionsDto,
  ): Promise<Pagination<RoleEntity>> {
    // 创建一个查询构建器，用于构建针对 role 表的 SQL 查询。
    const queryBuilder = this.roleRepository.createQueryBuilder('role')

    return paginate<RoleEntity>(queryBuilder, { page, pageSize })
  }

  // 查找用户角色列表
  async list(
    { name, value, remark, status, page, pageSize }: RoleQueryDto,
  ): Promise<Pagination<RoleEntity>> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(value ? { value: Like(`%${value}%`) } : null),
        ...(remark ? { remark: Like(`%${remark}%`) } : null),
        ...(!isNil(status) ? { status } : null),
      })

    return paginate<RoleEntity>(queryBuilder, { page, pageSize })
  }

  // 根据角色 id获取角色信息
  async info(id: Uuid): Promise<RoleResponse> {
    const info = await this.roleRepository
      .createQueryBuilder('role')
      .where({ id })
      .getOne()
    const menus = await this.menuRepository.find({
      where: { roles: { id } },
      select: ['id'],
    })

    return new RoleResponse(info, { menuIds: menus.map(m => m.id) })
  }

  // 删除角色
  async delete(id: Uuid): Promise<void> {
    if (id === ROOT_ROLE_ID)
      throw new Error('不能删除超级管理员')
    await this.roleRepository.delete(id)
  }

  // 创建角色
  async create({ menuIds, ...data }: RoleDto): Promise<{ roleId: Uuid }> {
    const role = await this.roleRepository.save({
      ...data,
      menus: menuIds ? await this.menuRepository.findBy({ id: In(menuIds) }) : [],
    })
    return { roleId: role.id }
  }

  // 更新角色信息
  // 如果传入的 menuIds 为空，则清空 role_menus 表中存有的关联数据，参考新增
  async update(id, { menuIds, ...data }: RoleUpdateDto): Promise<void> {
    await this.roleRepository.update(id, data)
    await this.entityManager.transaction(async (manager) => {
      const role = await this.roleRepository.findOne({ where: { id } })
      role.menus = menuIds?.length
        ? await this.menuRepository.findBy({ id: In(menuIds) })
        : []
      await manager.save(role)
    })
  }

  // 根据用户id查找角色信息
  async getRoleIdsByUid(uid: Uuid): Promise<Uuid[]> {
    const roles = await this.roleRepository.find({
      where: {
        users: { id: uid },
      },
    })

    if (!isEmpty(roles))
      return roles.map(r => r.id)

    return []
  }

  async getRoleValues(ids: Uuid[]): Promise<string[]> {
    return (
      await this.roleRepository.findBy({
        id: In(ids),
      })
    ).map(r => r.value)
  }

  // 通过用户ID查询是否有管理者角色
  async isAdminRoleByUid(uid: Uuid): Promise<boolean> {
    const roles = await this.roleRepository.find({
      where: {
        users: { id: uid },
      },
    })

    if (!isEmpty(roles)) {
      return roles.some(
        r => r.id === ROOT_ROLE_ID,
      )
    }
    return false
  }

  // 判断是否有管理者角色
  hasAdminRole(rids: Uuid[]): boolean {
    return rids.includes(ROOT_ROLE_ID)
  }

  // 根据角色ID查找是否有关联用户
  async checkUserByRoleId(id: Uuid): Promise<boolean> {
    return this.roleRepository.exists({
      where: {
        users: {
          roles: { id },
        },
      },
    })
  }
}
