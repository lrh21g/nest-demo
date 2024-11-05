import { EmailField, StringField } from '~/common/decorators'

export class UserLoginDto {
  @EmailField({ description: 'Email 邮箱' })
  readonly email!: string

  @StringField({ description: '密码' })
  readonly password!: string
}
