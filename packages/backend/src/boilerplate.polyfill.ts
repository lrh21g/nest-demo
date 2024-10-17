import { compact, map } from 'lodash'
import { Brackets, SelectQueryBuilder } from 'typeorm'
import { AbstractEntity } from './common/abstract.entity'

import { AbstractDto } from './common/dtos/abstract.dto'
import { PageDto } from './common/dtos/page.dto'
import { PageMetaDto } from './common/dtos/page-meta.dto'
import { PageOptionsDto } from './common/dtos/page-options.dto'

import 'source-map-support/register'

SelectQueryBuilder.prototype.searchByString = function (
  q,
  columnNames,
  options,
) {
  if (!q) {
    return this
  }

  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`)
      }
    }),
  )

  if (options?.formStart) {
    this.setParameter('q', `${q}%`)
  }
  else {
    this.setParameter('q', `%${q}%`)
  }

  return this
}

SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean
    takeAll: boolean
  }>,
) {
  if (!options?.takeAll) {
    this.skip(pageOptionsDto.skip).take(pageOptionsDto.pageNum)
  }

  const entities = await this.getMany()

  let itemCount = -1

  if (!options?.skipCount) {
    itemCount = await this.getCount()
  }

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  })

  return [entities, pageMetaDto]
}

// eslint-disable-next-line no-extend-native
Array.prototype.toDtos = function <
  Entity extends AbstractEntity<Dto>,
  Dto extends AbstractDto,
>(options?: unknown): Dto[] {
  return compact(
    map<Entity, Dto>(this as Entity[], item => item.toDto(options as never)),
  )
}

// eslint-disable-next-line no-extend-native
Array.prototype.toPageDto = function (
  pageMetaDto: PageMetaDto,
  options?: unknown,
) {
  return new PageDto(this.toDtos(options), pageMetaDto)
}
