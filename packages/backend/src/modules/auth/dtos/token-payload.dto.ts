import { NumberField, StringField } from '~/common/decorators'

export class TokenPayloadDto {
  @NumberField({ description: '过期时间' })
  expiresIn: number

  @StringField({ description: 'accessToken' })
  accessToken: string

  constructor(data: { expiresIn: number, accessToken: string }) {
    this.expiresIn = data.expiresIn
    this.accessToken = data.accessToken
  }
}
