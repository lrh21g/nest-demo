import type { PageOptionsDto } from './page-options.dto'
import { BooleanField, NumberField } from '../decorators'

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto
  itemCount: number
}

export class PageMetaDto {
  @NumberField()
  readonly page: number

  @NumberField()
  readonly pageNum: number

  @NumberField()
  readonly itemCount: number

  @NumberField()
  readonly pageCount: number

  @BooleanField()
  readonly hasPreviousPage: boolean

  @BooleanField()
  readonly hasNextPage: boolean

  constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
    this.page = pageOptionsDto.page
    this.pageNum = pageOptionsDto.pageNum
    this.itemCount = itemCount
    this.pageCount = Math.ceil(this.itemCount / this.pageNum)
    this.hasPreviousPage = this.page > 1
    this.hasNextPage = this.page < this.pageCount
  }
}
