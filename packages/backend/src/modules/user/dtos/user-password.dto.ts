import { PasswordFieldOptional, UsernameField } from '~/common/decorators'

export class PasswordUpdateDto {
  @PasswordFieldOptional({ description: '旧密码' })
  oldPassword: string

  @PasswordFieldOptional({ description: '新密码' })
  newPassword: string
}

export class UserPasswordDto {
  @PasswordFieldOptional({ description: '更改后的密码' })
  password: string
}

export class UserExistDto {
  @UsernameField({ description: '用户名' })
  username: string
}
