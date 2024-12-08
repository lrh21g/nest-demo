import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'
import { BusinessException } from '~/common/exceptions'

import { AuthStrategy, ErrorEnum } from '~/constants'
import { UserService } from '../../user/user.service'

// JwtStrategy （Passport JWT 策略） ： 通过扩展 PassportStrategy 类来配置 Passport 策略
// 在实现策略时，可以通过将第二个参数传递给 PassportStrategy 函数来为其命名。否则，每个策略都会有一个默认的名称（例如，jwt-strategy 的默认名称为 'jwt'）：
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.JWT) {
  constructor(
    configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      // 提供从 Request 中提取 JWT 的方法。将使用标准方法，在 API 请求的 Authorization 头部中提供一个 Bearer Token。
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 如果为 true，则不验证令牌的有效期。默认为 false
      // ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.publicKey'),
    })
  }

  // 对于 jwt-strategy，Passport 首先验证 JWT 的签名并解码 JSON。然后调用 validate() 方法，将解码的 JSON 作为其单个参数传递。
  // 基于 JWT 签名的工作方式，我们保证正在接收一个我们以前签名并发放给有效用户的有效令牌。
  async validate(payload: IAuthUser) {
    const user = await this.userService.findOne({
      id: payload.uid,
    })
    // const user = await this.userService.getUser(args.uid)

    if (!user) {
      throw new BusinessException(ErrorEnum.USER_NOT_FOUND)
    }

    return payload
  }
}
