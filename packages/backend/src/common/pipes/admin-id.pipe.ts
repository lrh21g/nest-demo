import {
  ArgumentMetadata,
  Injectable,
  NotAcceptableException,
  PipeTransform,
} from '@nestjs/common'
import { isUUID } from 'class-validator'
import { ROOT_ROLE_ID } from '~/constants'

@Injectable()
export class AdminIdPipe implements PipeTransform {
  transform(value: string, _metadata: ArgumentMetadata) {
    if (!(isUUID(value, '4') || value === ROOT_ROLE_ID)) {
      throw new NotAcceptableException('id 格式不正确')
    }

    return value
  }
}
