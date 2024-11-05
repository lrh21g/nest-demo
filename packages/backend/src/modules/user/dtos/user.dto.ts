import {
  BooleanFieldOptional,
  EmailFieldOptional,
  PhoneFieldOptional,
  StringFieldOptional,
} from '~/common/decorators'
import { AbstractDto } from '~/common/dtos/abstract.dto'
import { UserEntity } from '../user.entity'

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true, description: '用户名' })
  username!: string

  @EmailFieldOptional({ nullable: true, description: 'Email 邮箱' })
  email?: string | null

  @PhoneFieldOptional({ nullable: true, description: '手机号码' })
  phone?: string | null

  @BooleanFieldOptional({ description: '是否激活' })
  isActive?: boolean

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user)

    this.username = user.username
    this.email = user.email
    this.phone = user.phone
    this.isActive = options?.isActive
  }
}
