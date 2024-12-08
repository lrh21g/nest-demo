import { PasswordField, UsernameField } from '~/common/decorators'

export class UserLoginDto {
  @UsernameField({ description: '用户名' })
  readonly username!: string

  @PasswordField({ description: '密码' })
  readonly password!: string
}
