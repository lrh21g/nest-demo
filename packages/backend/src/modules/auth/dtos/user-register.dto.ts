import { EmailField, PasswordField, PhoneFieldOptional, StringField } from '~/common/decorators'

export class UserRegisterDto {
  @StringField({ description: '用户名' })
  readonly username!: string

  @EmailField({ description: 'Email 邮箱' })
  readonly email!: string

  @PasswordField({ minLength: 6, description: '密码' })
  readonly password!: string

  @PhoneFieldOptional({ description: '手机号码' })
  phone?: string
}
