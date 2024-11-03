import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserController } from './user.controller'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'

@Module({
  imports: [
    // 使用 forFeature 创建模块时，希望使用动态模块的 forRoot 配置，但需要修改一些特定于调用模块需求的配置（例如，该模块应该访问哪个存储库，或者记录器应该使用哪个上下文）。
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
  ],
  exports: [
    UserService,
  ],
})
export class UserModule {}
