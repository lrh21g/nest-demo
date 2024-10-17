import { forwardRef, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

import { JwtStrategy } from './jwt.strategy'
import { PublicStrategy } from './public.strategy'

@Module({
  imports: [
    // 当两个类互相依赖时就会出现循环依赖. 例如，当 A 类需要 B 类，而 B 类也需要 A 类时，就会产生循环依赖。
    // 使用前向引用处理循环依赖：允许 Nest 使用 forwardRef() 实用函数引用尚未定义的类。
    forwardRef(() => UserModule),
    // 使用 register 创建模块时，希望为调用模块配置特定的动态模块，仅供调用模块使用。
    // 使用 PassportModule.register 方法配置了 Passport 认证模块，并设置了默认的认证策略为 jwt。
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.registerAsync 方法用于动态配置 JWT 模块，通过 useFactory 函数获取配置信息。
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          // 私钥
          privateKey: configService.get<string>('auth.privateKey'),
          // 公钥
          publicKey: configService.get<string>('auth.publicKey'),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: configService.get<number>('auth.expirationTime'),
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PublicStrategy],
  exports: [JwtModule, AuthService],
})

export class AuthModule {}
