import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { UserNotFoundException } from '~/common/exceptions'
import { RoleType, TokenType } from '~/constants'
import { validateHash } from '~/utils'

import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'

import { TokenPayloadDto } from './dtos/token-payload.dto'
import { UserLoginDto } from './dtos/user-login.dto'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async createAccessToken(data: {
    role: RoleType
    userId: Uuid
  }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.get<number>('auth.expirationTime'),
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
        role: data.role,
      }),
    })
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findOne({
      email: userLoginDto.email,
    })

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user?.password,
    )

    if (!isPasswordValid) {
      throw new UserNotFoundException()
    }

    return user!
  }
}
