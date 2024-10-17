import { EmailField, PasswordField, PhoneFieldOptional, StringField } from '~/common/decorators'

export class UserRegisterDto {
  @StringField()
  readonly username!: string

  @EmailField()
  readonly email!: string

  @PasswordField({ minLength: 6 })
  readonly password!: string

  @PhoneFieldOptional()
  phone?: string
}
