import { ClassField } from '~/common/decorators'
import { UserEntity } from '~/modules/user/user.entity'
import { UserDto } from '../../user/dtos/user.dto'
import { TokenResponse } from './token-response'

export class LoginResponseDto {
  @ClassField(() => UserDto, { description: '用户信息' })
  user: UserDto

  @ClassField(() => TokenResponse, { description: 'token 信息' })
  token: TokenResponse

  constructor(user: UserDto, token: TokenResponse) {
    this.user = user
    this.token = token
  }
}

export class LoginResponse {
  user: UserEntity

  token: TokenResponse

  constructor(user: UserEntity, token: TokenResponse) {
    this.user = user
    this.token = token
  }
}
