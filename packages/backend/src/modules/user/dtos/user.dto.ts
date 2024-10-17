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
  @StringFieldOptional({ nullable: true })
  username!: string

  @EmailFieldOptional({ nullable: true })
  email?: string | null

  @PhoneFieldOptional({ nullable: true })
  phone?: string | null

  @BooleanFieldOptional()
  isActive?: boolean

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user)

    this.username = user.username
    this.email = user.email
    this.phone = user.phone
    this.isActive = options?.isActive
  }
}
