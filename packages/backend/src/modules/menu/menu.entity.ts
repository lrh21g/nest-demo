import { Column, Entity, ManyToMany, Relation } from 'typeorm'
import { CompleteEntity } from '~/common/entity/abstract.entity'
import { RoleEntity } from '../role/role.entity'
import { MenuExtOpenModeEnum, MenuKeepAliveEnum, MenuShowEnum, MenuStatusEnum, MenuTypeEnum } from './menu.constant'

@Entity({ name: 'menu' })
export class MenuEntity extends CompleteEntity {
  @Column({ type: 'uuid', nullable: true, comment: '父级菜单' })
  parentId: Uuid

  @Column({ comment: '菜单或权限名称' })
  name: string

  @Column({ nullable: true, comment: '前端路由地址' })
  path: string

  @Column({ nullable: true, comment: '对应权限' })
  permission: string

  @Column({ type: 'tinyint', default: MenuTypeEnum.MENU_GROUP, comment: '菜单类型：0-目录，1-菜单，2-权限' })
  type: number

  @Column({ nullable: true, default: '', comment: '菜单图标' })
  icon: string

  @Column({ type: 'int', nullable: true, default: 0, comment: '排序' })
  orderNo: number

  @Column({ nullable: true, comment: '菜单路由路径或外链' })
  component: string

  @Column({ type: 'boolean', default: false, comment: '是否外链' })
  isExt: boolean

  @Column({ type: 'tinyint', default: MenuExtOpenModeEnum.OUTER, comment: '外链打开方式：1-外链，2-内嵌' })
  extOpenMode: number

  @Column({ type: 'tinyint', default: MenuKeepAliveEnum.KEEP_ALIVE, comment: '是否缓存页面：1-缓存，0-不缓存' })
  keepAlive: number

  @Column({ type: 'tinyint', default: MenuShowEnum.SHOW, comment: '菜单是否显示：1-显示，0-隐藏' })
  show: number

  @Column({ nullable: true, comment: '设置当前路由高亮的菜单项，一般用于详情页' })
  activeMenu: string

  @Column({ type: 'tinyint', default: MenuStatusEnum.ENABLE, comment: '状态：1-启用，0-禁用' })
  status: number

  @ManyToMany(() => RoleEntity, role => role.menus, {
    onDelete: 'CASCADE',
  })
  roles: Relation<RoleEntity[]>
}
