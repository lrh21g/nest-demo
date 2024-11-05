import { BooleanField, NumberField } from '../decorators'
import { PageOptionsDto } from './page-options.dto'

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto
  itemCount: number
}

export class PageMetaDto {
  @NumberField({ description: '页数' })
  readonly page: number

  @NumberField({ description: '每页数量' })
  readonly pageNum: number

  @NumberField({ description: '总数量' })
  readonly itemCount: number

  @NumberField({ description: '总页数' })
  readonly pageCount: number

  @BooleanField({ description: '是否有上一页' })
  readonly hasPreviousPage: boolean

  @BooleanField({ description: '是否有下一页' })
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
