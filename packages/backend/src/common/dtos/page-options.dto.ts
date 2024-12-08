import { OrderEnum } from '~/constants'
import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '../decorators'

// PageOptionsDto 为数据传输对象（DTO）抽象类，用于处理分页请求的选项
export class PageOptionsDto {
  // 排序
  @EnumFieldOptional(() => OrderEnum, {
    description: '排序',
    default: OrderEnum.ASC,
  })
  readonly order: OrderEnum = OrderEnum.ASC

  // 页数
  @NumberFieldOptional({
    description: '页数',
    minimum: 1,
    default: 1,
    int: true,
  })
  readonly page: number = 1

  // 每页数量
  @NumberFieldOptional({
    description: '每页数量',
    minimum: 1,
    maximum: 50,
    default: 10,
    int: true,
  })
  readonly pageNum: number = 10

  // 当前页偏移量（跳过的项数）
  get skip(): number {
    return (this.page - 1) * this.pageNum
  }

  // 搜索查询字符串
  @StringFieldOptional()
  readonly q?: string
}
