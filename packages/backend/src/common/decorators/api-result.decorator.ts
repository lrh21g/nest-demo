import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'

import { ResOp } from '../model/response.model'

const baseTypeNames = ['String', 'Number', 'Boolean']

function genBaseProp(type: Type<any>) {
  if (baseTypeNames.includes(type.name))
    return { type: type.name.toLocaleLowerCase() }
  else
    return { $ref: getSchemaPath(type) }
}

export function ApiResult<TModel extends Type<any>>({
  type,
  isPage,
}: {
  type?: TModel | TModel[]
  isPage?: boolean
}) {
  let prop = null

  if (Array.isArray(type)) {
    if (isPage) {
      prop = {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: { $ref: getSchemaPath(type[0]) },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number', default: 0 },
              pageNum: { type: 'number', default: 0 },
              itemCount: { type: 'number', default: 0 },
              pageCount: { type: 'number', default: 0 },
              hasPreviousPage: { type: 'boolean', default: false },
              hasNextPage: { type: 'boolean', default: true },
            },
          },
        },
      }
    }
    else {
      prop = {
        type: 'array',
        items: genBaseProp(type[0]),
      }
    }
  }
  else if (type) {
    prop = genBaseProp(type)
  }
  else {
    prop = { type: 'null', default: null }
  }

  const model = Array.isArray(type) ? type[0] : type

  return applyDecorators(
    ApiExtraModels(model),
    ApiExtraModels(ResOp),
    (
      target: object,
      key: string | symbol,
      descriptor: TypedPropertyDescriptor<any>,
    ) => {
      queueMicrotask(() => {
        ApiResponse({
          status: HttpStatus.OK,
          schema: {
            allOf: [
              { $ref: getSchemaPath(ResOp) },
              {
                properties: {
                  data: prop,
                },
              },
            ],
          },
        })(target, key, descriptor)
      })
    },
  )
}
