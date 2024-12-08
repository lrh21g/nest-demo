import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '~/common/decorators'
import { OrderEnum } from '~/constants'

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
    default: 10,
    int: true,
  })
  readonly pageSize: number = 10

  // 搜索查询字符串
  @StringFieldOptional()
  readonly q?: string
}
