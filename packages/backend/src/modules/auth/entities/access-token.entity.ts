import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Relation,
} from 'typeorm'

import { AbstractEntity } from '~/common/entity/abstract.entity'
import { UserEntity } from '~/modules/user/user.entity'
import { RefreshTokenEntity } from './refresh-token.entity'

@Entity('user_access_tokens')
export class AccessTokenEntity extends AbstractEntity {
  @Column({ length: 800, comment: 'access_token 值' })
  value!: string

  @Column({ comment: '令牌过期时间' })
  expiredAt!: Date

  // @OneToOne 用于定义一对一的关系.它表示当前实体与另一个实体（此处为 RefreshTokenEntity）之间存在一对一的关联。
  @OneToOne(
    () => RefreshTokenEntity,
    refreshToken => refreshToken.accessToken,
    {
      cascade: true,
    },
  )
  refreshToken!: Relation<RefreshTokenEntity>

  // @ManyToOne 用于定义多对一的关系.它表示当前实体与另一个实体（此处为 UserEntity）之间存在多对一的关联。
  @ManyToOne(
    () => UserEntity,
    user => user.accessTokens,
    {
      // onDelete : 当引用的对象被删除时，指定外键应如何处理
      // > 'CASCADE' 表示当关联的 UserEntity 记录被删除时，所有与其关联的记录也会被自动删除。
      onDelete: 'CASCADE',
    },
  )
  // @JoinColumn : 定义了关系中包含具有外键的连接列的一侧，允许自定义连接列的名称和引用列的名称。
  // 指定外键列的名称为 user_id，该列会存储关联的 UserEntity 实例的 ID。
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>
}
