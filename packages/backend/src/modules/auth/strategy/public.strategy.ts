import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthStrategy } from '~/constants'

@Injectable()
// PublicStrategy （Passport Public 策略） ： 通过扩展 PassportStrategy 类来配置 Passport 策略
// 在实现策略时，可以通过将第二个参数传递给 PassportStrategy 函数来为其命名。
// PublicStrategy 用于无需身份验证的公共资源访问场景。
export class PublicStrategy extends PassportStrategy(Strategy, AuthStrategy.PUBLIC) {
  constructor() {
    // 调用了父类 PassportStrategy 的构造函数。由于没有传递参数，基类 Strategy 的默认行为被保留。
    super()
  }

  // authenticate 方法： 用于处理具体的认证逻辑
  authenticate(): void {
    // this.success() 是 Passport 策略中用来表示认证成功的方法，调用它意味着认证通过。
    this.success({ [Symbol.for('isPublic')]: true })
  }
}
