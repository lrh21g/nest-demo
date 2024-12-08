import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import Redis from 'ioredis'
import { isEmpty, isNil } from 'lodash'

import { EntityManager, FindOptionsWhere, In, Like, Repository } from 'typeorm'
import { InjectRedis } from '~/common/decorators'
import { BusinessException } from '~/common/exceptions'
import { ErrorEnum, ROOT_ROLE_ID } from '~/constants'
import { paginate } from '~/helper/paginate'
import { Pagination } from '~/helper/paginate/pagination'
import { genAuthPermKey, genAuthPVKey, genAuthTokenKey, genOnlineUserKey, validateHash } from '~/utils'
import { UserRegisterDto } from '../auth/dtos/user-register.dto'
import { AccessTokenEntity } from '../auth/entities/access-token.entity'
import { RoleEntity } from '../role/role.entity'
import { UserDto, UserQueryDto, UserUpdateDto } from './dtos/user.dto'
import { PasswordUpdateDto } from './dtos/user-password.dto'
import { UserStatusEnum } from './user.constant'
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  async findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy(findData)
  }

  // 通过用户id查找用户
  async findUserById(uid: Uuid): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where({
        id: uid,
        status: UserStatusEnum.ENABLE,
      })
      .getOne()
  }

  // 通过用户名查找用户
  async findUserByUserName(username: string): Promise<UserEntity | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .where({
        username,
        status: UserStatusEnum.ENABLE,
      })
      .getOne()
  }

  // 注册用户
  async register(userRegisterDto: UserRegisterDto): Promise<UserEntity> {
    const { username } = userRegisterDto
    const exists = await this.userRepository.findOneBy({
      username,
    })
    if (!isEmpty(exists))
      throw new BusinessException(ErrorEnum.SYSTEM_USER_EXISTS)

    const user = this.userRepository.create(userRegisterDto)
    await this.userRepository.save(user)

    return user
  }

  // 获取用户信息
  async getAccountInfo(uid: Uuid): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository
      .createQueryBuilder('user')
      // 进行左链接操作（LEFT JOIN 从左表返回所有的行，即使右表中没有匹配。如果右表中没有匹配，则结果为 NULL），并将所有选择属性添加到 SELECT 中。
      // > 'user.roles' 是 user 实体中的 roles 关系字段，表示用户与角色之间的关系。
      // > 'role' 是 roles 表的别名，表示连接后的角色表的引用。
      // andSelect 表示不仅会进行连接，还会选择 roles 表的数据，以便能够将角色信息加载到结果中。
      .leftJoinAndSelect('user.roles', 'role')
      .where(`user.id = :uid`, { uid })
      .getOne()

    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.USER_NOT_FOUND)

    return user
  }

  // 更新个人信息
  async updateAccountInfo(uid: Uuid, info: UserUpdateDto): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: uid })

    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.USER_NOT_FOUND)

    const data = {
      ...(info.nickname ? { nickname: info.nickname } : null),
      ...(info.email ? { email: info.email } : null),
      ...(info.phone ? { phone: info.phone } : null),
      ...(info.remark ? { remark: info.remark } : null),
    }

    await this.userRepository.update({ id: uid }, data)
  }

  // 更新用户密码
  async updatePassword(uid: Uuid, updatePassword: PasswordUpdateDto): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: uid })

    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.USER_NOT_FOUND)

    const isPasswordValid = await validateHash(
      updatePassword.oldPassword,
      user?.password,
    )
    // 原密码不一致，不允许更改
    if (isPasswordValid)
      throw new BusinessException(ErrorEnum.PASSWORD_MISMATCH)

    await this.userRepository.update({ id: uid }, { password: updatePassword.newPassword })
    await this.upgradePasswordV(user.id)
  }

  // 强制更新用户密码
  async forceUpdatePassword(uid: Uuid, password: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: uid })

    await this.userRepository.update({ id: uid }, { password })
    await this.upgradePasswordV(user.id)
  }

  // 创建用户
  async create({
    username,
    password,
    roleIds,
    ...data
  }: UserDto): Promise<void> {
    const exists = await this.userRepository.findOneBy({
      username,
    })
    if (!isEmpty(exists))
      throw new BusinessException(ErrorEnum.SYSTEM_USER_EXISTS)

    await this.entityManager.transaction(async (manager) => {
      // TODO 初始化密码
      // ......

      const u = manager.create(UserEntity, {
        username,
        password,
        ...data,
        roles: await this.roleRepository.findBy({ id: In(roleIds) }),
      })

      const result = await manager.save(u)
      return result
    })
  }

  // 更新用户信息
  async update(
    uid: Uuid,
    { password, roleIds, status, ...data }: UserUpdateDto,
  ): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      if (password)
        await this.forceUpdatePassword(uid, password)

      await manager.update(
        UserEntity,
        { id: uid },
        {
          ...data,
          status,
        },
      )

      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .where('user.id = :uid', { uid })
        .getOne()
      if (roleIds) {
        await manager
          .createQueryBuilder()
          .relation(UserEntity, 'roles')
          .of({ id: uid })
          .addAndRemove(roleIds, user.roles)
      }

      if (status === 0) {
        // 禁用状态
        await this.forbidden(uid)
      }
    })
  }

  // 通过用户id查询用户信息
  async info(uid: Uuid): Promise<UserEntity> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :uid', { uid })
      .getOne()

    if (!userEntity) {
      throw new BusinessException(ErrorEnum.USER_NOT_FOUND)
    }

    return userEntity
  }

  // 根据ID列表删除用户
  async delete(uids: Uuid[]): Promise<void | never> {
    const rootUid = await this.findRootUid()
    if (uids.includes(rootUid))
      throw new BadRequestException('不能删除root用户!')

    await this.userRepository.delete(uids as string[])
  }

  // 查找超管的用户ID
  async findRootUid(): Promise<Uuid> {
    const user = await this.userRepository.findOneBy({
      roles: { id: ROOT_ROLE_ID },
    })
    return user.id
  }

  // 获取用户列表
  async list(
    { username, nickname, email, status, page, pageSize }: UserQueryDto,
  ): Promise<Pagination<UserEntity>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      // .where('user.id NOT IN (:...ids)', { ids: [rootUid, uid] })
      .where({
        ...(username ? { username: Like(`%${username}%`) } : null),
        ...(nickname ? { nickname: Like(`%${nickname}%`) } : null),
        ...(email ? { email: Like(`%${email}%`) } : null),
        ...(!isNil(status) ? { status } : null),
      })

    return paginate<UserEntity>(queryBuilder, { page, pageSize })
  }

  // 禁用用户
  async forbidden(uid: Uuid, accessToken?: string): Promise<void> {
    await this.redis.del(genAuthPVKey(uid))
    await this.redis.del(genAuthTokenKey(uid))
    await this.redis.del(genAuthPermKey(uid))

    if (accessToken) {
      const token = await AccessTokenEntity.findOne({
        where: { value: accessToken },
      })
      this.redis.del(genOnlineUserKey(token.id))
    }
  }

  // 禁用多个用户
  async multiForbidden(ids: Uuid[]): Promise<void> {
    if (ids) {
      const pvs: string[] = []
      const ts: string[] = []
      const ps: string[] = []
      ids.forEach((id) => {
        pvs.push(genAuthPVKey(id))
        ts.push(genAuthTokenKey(id))
        ps.push(genAuthPermKey(id))
      })
      await this.redis.del(pvs)
      await this.redis.del(ts)
      await this.redis.del(ps)
    }
  }

  // 更新用户版本密码
  async upgradePasswordV(uid: Uuid): Promise<void> {
    // admin:passwordVersion:${param.id}
    const v = await this.redis.get(genAuthPVKey(uid))
    if (!isEmpty(v))
      await this.redis.set(genAuthPVKey(uid), Number.parseInt(v) + 1)
  }
}
