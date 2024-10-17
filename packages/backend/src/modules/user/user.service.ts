import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { FindOptionsWhere, Repository } from 'typeorm'
import { PageDto } from '~/common/dtos/page.dto'

import { UserNotFoundException } from '~/common/exceptions'
import { UserRegisterDto } from '../auth/dtos/user-register.dto'
import { UserDto } from './dtos/user.dto'
import { UsersPageOptionsDto } from './dtos/user-page-options.dto'
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOneBy(findData)
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
