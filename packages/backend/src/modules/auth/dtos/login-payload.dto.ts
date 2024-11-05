import { ClassField } from '~/common/decorators'
import { UserDto } from '../../user/dtos/user.dto'
import { TokenPayloadDto } from './token-payload.dto'

export class LoginPayloadDto {
  @ClassField(() => UserDto, { description: '用户信息' })
  user: UserDto

  @ClassField(() => TokenPayloadDto, { description: 'token 信息' })
  token: TokenPayloadDto

  constructor(user: UserDto, token: TokenPayloadDto) {
    this.user = user
    this.token = token
  }
}
