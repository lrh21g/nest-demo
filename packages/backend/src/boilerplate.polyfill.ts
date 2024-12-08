import { Brackets, SelectQueryBuilder } from 'typeorm'

import { PageMetaDto } from './common/dtos/page-meta.dto'
import { PageOptionsDto } from './common/dtos/page-options.dto'

import 'source-map-support/register'

// 用于根据一个字符串查询对多个列进行模糊搜索
SelectQueryBuilder.prototype.searchByString = function (
  q, // 搜索的字符串
  columnNames, // 需要搜索的列名数组
  options, // 可选参数，用于控制搜索的方式，如是否从开头开始匹配等。
) {
  // 如果 q（查询字符串）为空或为 undefined，则直接返回当前的查询构建器实例 this，这意味着不会进行任何过滤操作。
  if (!q) {
    return this
  }

  // this.andWhere 添加了一个 SQL 条件语句。
  // Brackets 用来将条件包裹起来，确保多个条件逻辑正确。
  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} LIKE :q`)
      }
    }),
  )

  // formStart 为 true，则搜索的字符串 q 将以 % 结尾，表示查询以 q 开头。
  // 否则，默认情况下，q 前后会加上 %，表示查询包含 q。
  if (options?.formStart) {
    // 设置查询参数 :q 的值
    this.setParameter('q', `${q}%`)
  }
  else {
    this.setParameter('q', `%${q}%`)
  }

  return this
}

// 扩展 SelectQueryBuilder ，用于处理分页逻辑
SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    // 用来决定是否跳过计算条目总数（getCount()），通常用于减少性能开销。
    skipCount: boolean
    // 如果设置为 true，表示查询时不限制返回结果的数量（即不进行分页）。
    takeAll: boolean
  }>,
) {
  if (!options?.takeAll) {
    // this.skip(pageOptionsDto.skip): 设置跳过的条目数，通常是 (当前页数 - 1) * 每页条目数。
    // this.take(pageOptionsDto.pageNum): 设置每页返回的最大条目数。
    this.skip(pageOptionsDto.skip).take(pageOptionsDto.pageNum)
  }

  // getMany() 返回满足当前条件的所有数据
  const entities = await this.getMany()

  let itemCount = -1

  if (!options?.skipCount) {
    // getCount() 查询数据库，返回符合条件的总条目数。
    itemCount = await this.getCount()
  }

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  })

  return [entities, pageMetaDto]
}

// // eslint-disable-next-line no-extend-native
// Array.prototype.toDtos = function <
//   Entity extends AbstractEntity<Dto>,
//   Dto extends AbstractDto,
// >(options?: unknown): Dto[] {
//   // compact 用于移除数组中的 null、undefined 或其他“假值”元素
//   // 确保返回的结果中没有无效的条目。
//   return compact(
//     // map 用于对每个元素执行操作。
//     // item => item.toDto(options as never)，这意味着对每个 Entity 对象，调用它的 toDto 方法，返回一个 Dto 对象。
//     map<Entity, Dto>(this as Entity[], item => item.toDto(options as never)),
//   )
// }

// // 用于将查询结果（一个数组）转换成分页后的数据对象。
// // eslint-disable-next-line no-extend-native
// Array.prototype.toPageDto = function (
//   pageMetaDto: PageMetaDto,
//   options?: unknown,
// ) {
//   return new PageDto(this.toDtos(options), pageMetaDto)
// }
