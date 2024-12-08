import {
  EmailField,
  PasswordField,
  PhoneFieldOptional,
  UsernameField,
} from '~/common/decorators'

export class UserRegisterDto {
  @UsernameField({ description: '用户名' })
  readonly username!: string

  @PasswordField({ minLength: 6, description: '密码' })
  readonly password!: string

  @EmailField({ description: 'Email 邮箱' })
  readonly email!: string

  @PhoneFieldOptional({ description: '手机号码' })
  phone?: string
}
