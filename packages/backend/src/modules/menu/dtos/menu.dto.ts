import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsBoolean,
  ValidateIf,
} from 'class-validator'
import { EnumField, EnumFieldOptional, NumberField, StringField, StringFieldOptional, UUIDFieldOptional } from '~/common/decorators'
import { OperatorDto } from '~/common/dtos/abstract.dto'
import { MenuExtOpenModeEnum, MenuKeepAliveEnum, MenuShowEnum, MenuStatusEnum, MenuTypeEnum } from '../menu.constant'

export class MenuDto extends OperatorDto {
  @ApiProperty({
    description: `
菜单类型:
- 0: 目录
- 1: 菜单
- 2: 权限
    `,
    enum: MenuTypeEnum,
  })
  @EnumFieldOptional(() => MenuTypeEnum, { description: '菜单类型' })
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
  @EnumField(() => MenuExtOpenModeEnum, { description: '外链打开方式', default: 1 })
  extOpenMode: number

  @ValidateIf((o: MenuDto) => o.type !== MenuTypeEnum.PERMISSION)
  @EnumField(() => MenuShowEnum, { description: '菜单是否显示', default: 1 })
  show: number

  @ValidateIf((o: MenuDto) => o.type !== MenuTypeEnum.PERMISSION && o.show === 0)
  @StringFieldOptional({ description: '设置当前路由高亮的菜单项，一般用于详情页' })
  activeMenu?: string

  @ValidateIf((o: MenuDto) => o.type === 1)
  @EnumField(() => MenuKeepAliveEnum, { description: '是否开启页面缓存', default: 1 })
  keepAlive: number

  @EnumField(() => MenuStatusEnum, { description: '状态', default: 1 })
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

export class MenuQueryDto extends PartialType(MenuDto) {}
