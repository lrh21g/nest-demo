import { PartialType, PickType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, ValidateIf } from 'class-validator'
import { toNumber } from 'lodash'

import { EnumField, NumberField, StringField, StringFieldOptional, UUIDFieldOptional } from '~/common/decorators'
import { OperatorDto } from '~/common/dtos/operator.dto'
import { MenuExtOpenModeEnum, MenuKeepAliveEnum, MenuShowEnum, MenuStatusEnum, MenuTypeEnum } from '../menu.constant'

export class MenuDto extends OperatorDto {
  // 菜单类型: 0-目录；1-菜单；2-权限
  @Transform(({ value }) => toNumber(value))
  @EnumField(() => MenuTypeEnum, { description: `菜单类型` })
  type: MenuTypeEnum

  @UUIDFieldOptional({ description: '父级菜单' })
  parentId: Uuid

  @StringField({ minLength: 2, description: '菜单或权限名称' })
  name: string

  @NumberField({ min: 0, int: true, description: '排序' })
  orderNo: number

  @ApiProperty({ description: '前端路由地址' })
  @ValidateIf(o => o.type !== MenuTypeEnum.PERMISSION)
  path: string

  @ApiProperty({ description: '是否外链', default: false })
  @ValidateIf(o => o.type !== MenuTypeEnum.PERMISSION)
  @IsBoolean()
  isExt: boolean

  @ValidateIf((o: MenuDto) => o.isExt)
  @Transform(({ value }) => toNumber(value))
  @EnumField(() => MenuExtOpenModeEnum, { description: '外链打开方式', default: MenuExtOpenModeEnum.OUTER })
  extOpenMode: number

  @ValidateIf((o: MenuDto) => o.type !== MenuTypeEnum.PERMISSION)
  @Transform(({ value }) => toNumber(value))
  @EnumField(() => MenuShowEnum, { description: '菜单是否显示', default: MenuShowEnum.SHOW })
  show: number

  // 设置当前路由高亮的菜单项，一般用于详情页
  @ValidateIf((o: MenuDto) => o.type !== MenuTypeEnum.PERMISSION && o.show === MenuShowEnum.SHOW)
  @StringFieldOptional({ description: '设置当前路由高亮的菜单项（一般用于详情页）' })
  activeMenu?: string

  @ValidateIf((o: MenuDto) => o.type === 1)
  @Transform(({ value }) => toNumber(value))
  @EnumField(() => MenuKeepAliveEnum, { description: '是否开启页面缓存', default: MenuKeepAliveEnum.KEEP_ALIVE })
  keepAlive: number

  @Transform(({ value }) => toNumber(value))
  @EnumField(() => MenuStatusEnum, { description: '状态', default: MenuStatusEnum.ENABLE })
  status: number

  @ValidateIf((o: MenuDto) => o.type !== MenuTypeEnum.PERMISSION)
  @StringFieldOptional({ description: '菜单图标' })
  icon?: string

  @ValidateIf((o: MenuDto) => o.type === MenuTypeEnum.PERMISSION)
  @StringFieldOptional({ description: '对应权限' })
  permission: string

  @ValidateIf((o: MenuDto) => o.type !== MenuTypeEnum.PERMISSION)
  @StringFieldOptional({ description: '菜单路由路径或外链' })
  component?: string
}

export class MenuUpdateDto extends PartialType(MenuDto) {}

export class MenuQueryDto extends PartialType(PickType(MenuDto, ['name', 'path', 'permission', 'component', 'status'])) {}
