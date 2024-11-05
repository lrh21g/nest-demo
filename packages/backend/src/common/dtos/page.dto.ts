import { ApiProperty } from '@nestjs/swagger'

import { ClassField } from '../decorators'
import { PageMetaDto } from './page-meta.dto'

export class PageDto<T> {
  @ApiProperty({ description: '每页数据', isArray: true })
  readonly list: T[]

  @ClassField(() => PageMetaDto, { description: '页数信息' })
  readonly meta: PageMetaDto

  constructor(list: T[], meta: PageMetaDto) {
    this.list = list
    this.meta = meta
  }
}
