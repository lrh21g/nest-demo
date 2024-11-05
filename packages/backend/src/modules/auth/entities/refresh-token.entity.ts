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
  @Column({ length: 800 })
  value!: string

  @Column()
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
