import { IntersectionType, PartialType } from '@nestjs/mapped-types'
import { Transform } from 'class-transformer'
import {
  EmailField,
  EnumFieldOptional,
  PasswordField,
  PhoneFieldOptional,
  StringFieldOptional,
  UsernameField,
} from '~/common/decorators'
import { IsUnique } from '~/common/validators/unique.validator'
import { PageOptionsDto } from '~/helper/paginate/page-options.dto'
import { UserStatusEnum } from '../user.constant'
import { UserEntity } from '../user.entity'

export class UserDto {
  @IsUnique({ entity: UserEntity, message: '用户名已存在' })
  @UsernameField({ description: '用户名' })
  username: string

  @PasswordField({ description: '密码' })
  password: string

  @StringFieldOptional({ each: true, description: '用户角色' })
  roleIds: Uuid[]

  @StringFieldOptional({ description: '昵称' })
  nickname: string

  @IsUnique({ entity: UserEntity, message: '邮箱已存在' })
  @EmailField({ description: 'Email 邮箱' })
  email: string | null

  @PhoneFieldOptional({ description: '手机号码' })
  phone?: string | null

  @StringFieldOptional({ description: '备注' })
  remark?: string

  @Transform(({ value }) => value || UserStatusEnum.ENABLE)
  @EnumFieldOptional(() => UserStatusEnum, { description: '状态' })
  status: UserStatusEnum
}

export class UserUpdateDto extends PartialType(UserDto) {}

export class UserQueryDto extends IntersectionType(PartialType(UserDto), PageOptionsDto) {}
