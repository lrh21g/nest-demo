import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthStrategy } from '~/constants'

@Injectable()
export class PublicGuard extends AuthGuard(AuthStrategy.PUBLIC) {
  async canActivate(_context: ExecutionContext) {
    return true
  }
}
