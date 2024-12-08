import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  Relation,
} from 'typeorm'

import { AbstractEntity } from '~/common/entity/abstract.entity'
import { AccessTokenEntity } from './access-token.entity'

@Entity('user_refresh_tokens')
export class RefreshTokenEntity extends AbstractEntity {
  @Column({ length: 800, comment: 'refresh_token 值' })
  value!: string

  @Column({ comment: '令牌过期时间' })
  expiredAt!: Date

  @OneToOne(
    () => AccessTokenEntity,
    accessToken => accessToken.refreshToken,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  accessToken!: Relation<AccessTokenEntity>
}
