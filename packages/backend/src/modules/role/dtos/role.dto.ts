import { IntersectionType, PartialType } from '@nestjs/mapped-types'
import { Transform } from 'class-transformer'

import { Matches } from 'class-validator'
import { EnumFieldOptional, StringField, StringFieldOptional, UUIDFieldOptional } from '~/common/decorators'
import { OperatorDto } from '~/common/dtos/operator.dto'
import { IsUnique } from '~/common/validators/unique.validator'
import { PageOptionsDto } from '~/helper/paginate/page-options.dto'
import { RoleStatusEnum } from '../role.constant'
import { RoleEntity } from '../role.entity'

export class RoleDto extends OperatorDto {
  @StringField({ minLength: 2, description: '角色名称' })
  name: string

  @IsUnique({ entity: RoleEntity })
  @Matches(/^[a-z0-9]+$/i, { message: '角色值只能包含字母和数字' })
  @StringField({ minLength: 2, description: '角色值' })
  value: string

  @StringFieldOptional({ description: '角色备注' })
  remark?: string

  @Transform(({ value }) => value || RoleStatusEnum.ENABLE)
  @EnumFieldOptional(() => RoleStatusEnum, { description: '状态：1-启用，0-禁用' })
  status: number

  @UUIDFieldOptional({ each: true, description: '关联菜单、权限编号' })
  menuIds?: Uuid[]
}

export class RoleResponse {
  menuIds?: Uuid[]

  constructor(role: RoleEntity, options?: { menuIds?: Uuid[] }) {
    Object.assign(this, role)
    this.menuIds = options?.menuIds || []
  }
}

export class RoleUpdateDto extends PartialType(RoleDto) {}

export class RoleQueryDto extends IntersectionType(PartialType(RoleDto), PageOptionsDto) {
  @StringFieldOptional({ description: '角色名称' })
  name?: string

  @StringFieldOptional({ description: '角色值' })
  value: string
}
