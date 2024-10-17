import { EmailField, StringField } from '~/common/decorators'

export class UserLoginDto {
  @EmailField()
  readonly email!: string

  @StringField()
  readonly password!: string
}
