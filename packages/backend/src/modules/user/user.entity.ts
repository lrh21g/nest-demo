import { Column, Entity } from 'typeorm'

import { AbstractEntity } from '~/common/abstract.entity'
import { UseDto } from '~/common/decorators'
import { RoleType } from '~/constants'
import { UserDto, UserDtoOptions } from './dtos/user.dto'

// UserEntity 类，基于 TypeORM 的实体类，用于映射到数据库中的 users 表。
// @Entity() 用于将一个类标识为数据库实体。通过这个装饰器，UserEntity 类将映射到数据库中的 users 表。其中， name: 'users'：指定表名为 users。
@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  // 表示该字段映射到 users 表中的 username 列，且该列必须是唯一的。
  @Column({ unique: true })
  username!: string

  // 表示 role 字段使用的是枚举类型，并且其默认值为 RoleType.USER。
  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role!: RoleType

  // 表示 phone 字段可以为 null，类型为字符串。
  @Column({ nullable: true, type: 'varchar' })
  phone!: string | null

  // 表示 email 字段也是可选的，并且是唯一的。
  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null

  // 表示 password 字段可以为空，类型是 varchar。
  @Column({ nullable: true, type: 'varchar' })
  password!: string | null
}
