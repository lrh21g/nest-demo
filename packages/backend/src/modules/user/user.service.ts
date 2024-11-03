import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'
import { FindOptionsWhere, Repository } from 'typeorm'

import { InjectRedis } from '~/common/decorators'
import { PageDto } from '~/common/dtos/page.dto'
import { BusinessException, UserNotFoundException } from '~/common/exceptions'
import { ErrorCode } from '~/constants'
import { genAuthPVKey, genAuthTokenKey, genOnlineUserKey } from '~/utils'
import { UserRegisterDto } from '../auth/dtos/user-register.dto'
import { AccessTokenEntity } from '../auth/entities/access-token.entity'
import { UserDto } from './dtos/user.dto'
import { UsersPageOptionsDto } from './dtos/user-page-options.dto'
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy(findData)
  }

  async register(userRegisterDto: UserRegisterDto): Promise<UserEntity> {
    const { username } = userRegisterDto
    const exists = await this.userRepository.findOneBy({
      username,
    })
    if (!isEmpty(exists))
      throw new BusinessException(ErrorCode.SYSTEM_USER_EXISTS)

    const user = this.userRepository.create(userRegisterDto)
    await this.userRepository.save(user)

    return user
  }

  async forbidden(userId: Uuid, accessToken?: string): Promise<void> {
    await this.redis.del(genAuthPVKey(userId))
    await this.redis.del(genAuthTokenKey(userId))
    // await this.redis.del(genAuthPermKey(userId))

    if (accessToken) {
      const token = await AccessTokenEntity.findOne({
        where: { value: accessToken },
      })
      this.redis.del(genOnlineUserKey(token.id))
    }
  }

  async createUser(userRegisterDto: UserRegisterDto): Promise<UserEntity> {
    const user = this.userRepository.create(userRegisterDto)

    await this.userRepository.save(user)

    return user
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto)

    return items.toPageDto(pageMetaDto)
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')

    queryBuilder.where('user.id = :userId', { userId })

    const userEntity = await queryBuilder.getOne()

    if (!userEntity) {
      throw new UserNotFoundException()
    }

    return userEntity.toDto()
  }
}
