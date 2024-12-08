import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'

import { createPaginationObject } from './create-pagination'
import { IPaginationOptions, PaginationTypeEnum } from './interface'
import { Pagination } from './pagination'

const DEFAULT_LIMIT = 10
const DEFAULT_PAGE = 1

/**
 * resolveOptions 解析分页选项
 * @param options 分页选项，类型为 IPaginationOptions。通常包含当前页（page）、每页记录数（pageSize）以及分页类型（paginationType）。
 * @returns 一个包含当前页（page）、每页记录数（pageSize）和分页类型（paginationType : limit / take）的数组。
 */
function resolveOptions(
  options: IPaginationOptions,
): [number, number, PaginationTypeEnum] {
  const { page, pageSize, paginationType } = options

  return [
    page || DEFAULT_PAGE,
    pageSize || DEFAULT_LIMIT,
    paginationType || PaginationTypeEnum.TAKE_AND_SKIP,
  ]
}

/**
 * paginateRepository 基于 TypeORM 的 Repository 实现分页查询。
 * @param repository Repository<T> 对象，通常是 TypeORM 的一个 repository 实例。
 * @param options 分页选项，类型为 IPaginationOptions。通常包含 page 和 pageSize（或者其他分页参数）。
 * @param searchOptions 可选的搜索条件，类型可以是 FindOptionsWhere<T> 或 FindManyOptions<T>，它定义了查询中要使用的过滤条件。
 * @returns Promise，返回一个 Promise 对象，其中包含一个 Pagination<T> 对象，它封装了分页后的数据（如当前页、总页数、每页记录数等）。
 */
async function paginateRepository<T>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T>> {
  // 解析 options 参数，得到当前页 (page) 和每页记录数 (limit)
  const [page, limit] = resolveOptions(options)

  const promises: [Promise<T[]>, Promise<number> | undefined] = [
    // repository.find：查询数据库，使用 skip 和 take 实现分页功能。
    repository.find({
      skip: limit * (page - 1),
      take: limit,
      ...searchOptions,
    }),
    // repository.count：获取总记录数，用于计算总页数。返回的是满足 searchOptions 条件的记录数。
    repository.count(searchOptions),
  ]

  const [items, total] = await Promise.all(promises)

  // 使用 createPaginationObject 函数创建并返回一个包含分页信息的对象。
  return createPaginationObject<T>({
    items, // 当前页的记录
    totalItems: total, // 符合条件的记录总数
    currentPage: page, // 当前页码
    limit, // 每页显示的记录数
  })
}

/**
 * paginateQueryBuilder 基于 TypeORM 的 SelectQueryBuilder 实现分页查询。
 * @param queryBuilder SelectQueryBuilder<T> 对象，通常是 TypeORM 的一个查询构造器实例。
 * @param options 分页选项，类型为 IPaginationOptions。通常包含分页相关的参数，如当前页 (page) 和每页记录数 (pageSize)。
 * @returns Promise，返回一个 Promise 对象，其中包含一个 Pagination<T> 对象，它封装了分页后的数据（如当前页、总页数、每页记录数等）。
 */
async function paginateQueryBuilder<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>> {
  // 调用 resolveOptions 函数，解析出分页参数当前页面（page）、每页记录数（limit）以及分页类型（paginationType : limit / take）。
  const [page, limit, paginationType] = resolveOptions(options)

  if (paginationType === PaginationTypeEnum.TAKE_AND_SKIP) {
    // 使用 take 和 skip 方法进行分页
    queryBuilder.take(limit).skip((page - 1) * limit)
  }
  else {
    // 使用 limit 和 offset 方法进行分页
    queryBuilder.limit(limit).offset((page - 1) * limit)
  }

  // queryBuilder.getManyAndCount()：执行查询，并返回查询结果（items）和记录总数（total）。
  const [items, total] = await queryBuilder.getManyAndCount()

  // 使用 createPaginationObject 函数创建并返回一个包含分页信息的对象。
  return createPaginationObject<T>({
    items, // 当前页的记录
    totalItems: total, // 符合条件的记录总数
    currentPage: page, // 当前页码
    limit, // 每页显示的记录数
  })
}

/**
 * paginateRaw 基于 TypeORM 的 SelectQueryBuilder 实现分页查询，但返回的是原始数据，而不是实体对象。
 * @param queryBuilder SelectQueryBuilder<T> 对象，通常是 TypeORM 的一个查询构造器实例。
 * @param options 分页选项，类型为 IPaginationOptions。通常包含分页相关的参数，如当前页 (page) 和每页记录数 (pageSize)。
 * @returns Promise，返回一个 Promise 对象，其中包含一个 Pagination<T> 对象，它封装了分页页后的数据（如当前页、总页数、每页记录数等）。
 */
export async function paginateRaw<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>> {
  // 调用 resolveOptions 函数，解析出分页参数当前页面（page）、每页记录数（limit）以及分页类型（paginationType : limit / take）。
  const [page, limit, paginationType] = resolveOptions(options)

  const promises: [Promise<T[]>, Promise<number> | undefined] = [
    // getRawMany()：返回原始的查询结果，而不是查询实体对象。T 泛型会被当做查询结果的类型，而不是 TypeORM 实体的类型。
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getRawMany<T>(),
    // getCount()：获取符合查询条件的总记录数，用于计算总页数。
    queryBuilder.getCount(),
  ]

  const [items, total] = await Promise.all(promises)

  // 使用 createPaginationObject 函数创建并返回一个包含分页信息的对象。
  return createPaginationObject<T>({
    items, // 当前页的记录
    totalItems: total, // 符合条件的记录总数
    currentPage: page, // 当前页码
    limit, // 每页显示的记录数
  })
}

/**
 * paginateRawAndEntities 函数基于 TypeORM 的 SelectQueryBuilder 实现分页查询，同时返回原始数据（raw）和实体对象（entities）。
 * @param queryBuilder SelectQueryBuilder<T> 对象，通常是 TypeORM 的一个查询构造器实例。
 * @param options 分页选项，类型为 IPaginationOptions。通常包含分页相关的参数，如当前页 (page) 和每页记录数 (pageSize)。
 * @returns Promise，返回一个 Promise 对象，其中包含一个 Pagination<T> 对象（封装了分页页后的数据（如当前页、总页数、每页记录数等））以及原始数据（raw，原始数据数组（不经过实体映射），即查询的原始记录）。
 */
export async function paginateRawAndEntities<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<[Pagination<T>, Partial<T>[]]> {
  const [page, limit, paginationType] = resolveOptions(options)

  const promises: [
    Promise<{ entities: T[], raw: T[] }>,
    Promise<number> | undefined,
  ] = [
    // getRawAndEntities()：会执行查询并返回一个对象，包含：
    // > entities：查询结果的实体对象。
    // > raw：查询的原始结果（即数据库返回的原始列数据）。
    (paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
    ).getRawAndEntities<T>(),
    // getCount()：获取符合查询条件的记录总数，用于计算总页数。
    queryBuilder.getCount(),
  ]

  const [itemObject, total] = await Promise.all(promises)

  return [
    createPaginationObject<T>({
      items: itemObject.entities,
      totalItems: total,
      currentPage: page,
      limit,
    }),
    itemObject.raw,
  ]
}

/**
 * paginate 重载函数
 * @param repository Repository<T> 对象，通常是 TypeORM 的一个 repository 实例。
 * @param options 分页选项，类型为 IPaginationOptions。
 * @param searchOptions 可选的搜索条件，类型可以是 FindOptionsWhere<T> 或 FindManyOptions<T>，它定义了查询中要使用的过滤条件。
 * @returns Promise，返回一个 Promise 对象，其中包含一个 Pagination<T> 对象，它封装了分页后的数据（如当前页、总页数、每页记录数等）。
 */
export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T>>
/**
 * paginate 重载函数
 * @param queryBuilder SelectQueryBuilder<T> 对象，通常是 TypeORM 的一个查询构造器实例。
 * @param options 分页选项，类型为 IPaginationOptions。
 * @returns Promise，返回一个 Promise 对象，其中包含一个 Pagination<T> 对象，它封装了分页后的数据（如当前页、总页数、每页记录数等）。
 */
export async function paginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<Pagination<T>>

export async function paginate<T extends ObjectLiteral>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
) {
  // 判断传入 repositoryOrQueryBuilder 是 Repository 还是 SelectQueryBuilder：
  // 如果是 Repository: 调用 paginateRepository 函数，处理基于 Repository 的分页逻辑。
  // 如果是 SelectQueryBuilder: 调用 paginateQueryBuilder 函数，处理基于查询构建器（SelectQueryBuilder）的分页逻辑。
  return repositoryOrQueryBuilder instanceof Repository
    ? paginateRepository<T>(repositoryOrQueryBuilder, options, searchOptions)
    : paginateQueryBuilder<T>(repositoryOrQueryBuilder, options)
}
