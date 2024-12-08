import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinTable, ManyToMany, Relation } from 'typeorm'

import { CompleteEntity } from '~/common/entity/abstract.entity'
import { MenuEntity } from '../menu/menu.entity'
import { UserEntity } from '../user/user.entity'
import { RoleStatusEnum } from './role.constant'

@Entity({ name: 'role' })
export class RoleEntity extends CompleteEntity {
  @Column({ length: 50, unique: true, comment: '角色名' })
  @ApiProperty({ description: '角色名' })
  name: string

  @Column({ unique: true, comment: '角色标识' })
  @ApiProperty({ description: '角色标识' })
  value: string

  @Column({ nullable: true, comment: '角色描述' })
  @ApiProperty({ description: '角色描述' })
  remark: string

  @Column({ type: 'tinyint', nullable: true, default: RoleStatusEnum.ENABLE, comment: '状态：1-启用，0-禁用' })
  @ApiProperty({ description: '状态：1-启用，0-禁用' })
  status: number

  @Column({ nullable: true, comment: '是否默认用户' })
  @ApiProperty({ description: '是否默认用户' })
  default: boolean

  @ApiHideProperty()
  @ManyToMany(() => UserEntity, user => user.roles)
  users: Relation<UserEntity[]>

  @ApiHideProperty()
  @ManyToMany(() => MenuEntity, menu => menu.roles, {})
  @JoinTable({
    name: 'role_menus',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Relation<MenuEntity[]>
}
