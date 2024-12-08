import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { Column, Entity, JoinTable, ManyToMany, OneToMany, Relation } from 'typeorm'

import { AbstractEntity } from '~/common/entity/abstract.entity'
import { AccessTokenEntity } from '../auth/entities/access-token.entity'
import { RoleEntity } from '../role/role.entity'
import { UserStatusEnum } from './user.constant'

// UserEntity 类，基于 TypeORM 的实体类，用于映射到数据库中的 users 表。
// @Entity() 用于将一个类标识为数据库实体。通过这个装饰器，UserEntity 类将映射到数据库中的 users 表。其中， name: 'users'：指定表名为 users。
@Entity({ name: 'user' })
export class UserEntity extends AbstractEntity {
  // 表示该字段映射到 users 表中的 username 列，且该列必须是唯一的。
  @Column({ unique: true, comment: '用户名' })
  @ApiProperty({ description: '用户名' })
  username: string

  @Exclude()
  // 表示 password 字段可以为空，类型是 varchar。
  @Column({ nullable: true, type: 'varchar', comment: '密码' })
  @ApiProperty({ description: '密码' })
  password: string | null

  @Column({ nullable: true, comment: '昵称' })
  @ApiProperty({ description: '昵称' })
  nickname: string

  // 表示 phone 字段可以为 null，类型为字符串。
  @Column({ nullable: true, type: 'varchar', comment: '手机号码' })
  @ApiProperty({ description: '手机号码' })
  phone: string | null

  // 表示 email 字段也是可选的，并且是唯一的。
  @Column({ unique: true, nullable: true, type: 'varchar', comment: 'Email 邮箱' })
  @ApiProperty({ description: 'Email 邮箱' })
  email: string | null

  @Column({ type: 'tinyint', nullable: true, default: UserStatusEnum.ENABLE, comment: '状态：1-启用，0-禁用' })
  @ApiProperty({ description: '状态：1-启用，0-禁用' })
  status: number

  @ManyToMany(() => RoleEntity, role => role.users)
  // @JoinTable 用于 多对多 关系，并描述“连接”表的连接列。
  @JoinTable({
    // 指定了连接表的名称。
    name: 'user_roles',
    // joinColumn 指定连接表中指向一方（在这里是用户）主键的列
    // name: 'user_id'：表示在连接表中，指向 user 实体的外键列名是 user_id。
    // referencedColumnName: 'id'：表示 user_id 列将引用 User 实体中的 id 字段。
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    // inverseJoinColumn 指定了连接表中指向另一方（在这里是角色）主键的列
    // name 表示在连接表中，指向 role 实体的外键列名是 role_id。
    // referencedColumnName 表示 role_id 列将引用 Role 实体中的 id 字段。
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Relation<RoleEntity[]>

  @ApiHideProperty()
  // OneToMany : 用于定义一对多关系。它表示当前实体与另一个实体（此处为 AccessTokenEntity）之间存在一对多的关联。
  @OneToMany(
    // 函数，返回需要建立关系的实体的类，即：AccessTokenEntity 实体
    () => AccessTokenEntity,
    // 回调函数，用于指定在 AccessTokenEntity 中表示这一关系的属性。
    // accessToken.user 表示每个 AccessTokenEntity 实体都有一个 user 属性，用于关联到当前实体
    accessToken => accessToken.user,
    {
      // 级联选项 : 在对当前实体进行插入、更新或删除操作时，会自动级联执行对相关联实体的操作
      // cascade 可以设置为 boolean 或级联选项的数组 ("insert" | "update" | "remove" | "soft-remove" | "recover")[]
      // cascade 默认值为 false，表示没有级联操作。将 cascade: true 设置为启用完全级联操作。也可以通过数组来指定选项。
      // 如果删除了一个用户实体，所有关联的 AccessTokenEntity 也会被自动删除
      cascade: true,
    },
  )
  // 关系可以是单向的或双向的，在关系属性中使用 Relation 包装类型，以避免循环依赖问题。
  // 定义了一个名为 accessTokens 的属性，它的类型是 Relation<AccessTokenEntity[]>，表示当前实体可以有多个关联的 AccessTokenEntity 实体。
  accessTokens: Relation<AccessTokenEntity[]>
}
