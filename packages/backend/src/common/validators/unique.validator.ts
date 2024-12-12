import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { isNil, merge } from 'lodash'
import { ClsService } from 'nestjs-cls'
import { DataSource, Not, ObjectType } from 'typeorm'

interface Condition {
  entity: ObjectType<any>
  // 如果没有指定字段则使用当前验证的属性作为查询依据
  field?: string
  // 验证失败的错误信息
  message?: string
}

@Injectable()
// ValidatorConstraint 用于注册自定义验证器类
// > name : 验证器名称
// > async : 设置为 true 表示验证器是异步的，返回 Promise。验证过程可能涉及数据库查询或其他异步操作。
@ValidatorConstraint({ name: 'entityItemUnique', async: true })
// 自定义 UniqueConstraint 验证器，用于验证某个字段的唯一性
export class UniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly cls: ClsService,
  ) {}

  // validate 方法自定义验证逻辑的核心，它会在验证时被调用
  async validate(value: any, args: ValidationArguments) {
    // 获取要验证的模型和字段
    const config: Omit<Condition, 'entity'> = {
      field: args.property, // 被验证对象的属性名称。
    }

    // condition 根据 args.constraints[0] 来决定验证的实体类型和字段。
    // args.constraints 是传递给验证器的参数数组，通常包含实体类型、字段名称、验证信息等。
    const condition = ('entity' in args.constraints[0]
      ? merge(config, args.constraints[0])
      : {
          ...config,
          entity: args.constraints[0],
        }) as unknown as Required<Condition>

    // 如果 entity 未定义，验证失败，返回 false
    if (!condition.entity)
      return false

    try {
      // 查询是否存在数据，如果已经存在则验证失败

      // 使用 dataSource.getRepository() 获取指定实体的仓库（Repository），准备进行查询操作。
      const repo = this.dataSource.getRepository(condition.entity)

      // 如果没有传自定义的错误信息（condition.message），则尝试获取该字段的注释（comment）作为信息提示
      if (!condition.message) {
        const targetColumn = repo.metadata.columns.find(n => n.propertyName === condition.field)
        if (targetColumn?.comment) {
          args.constraints[0].message = `已存在相同的${targetColumn.comment}`
        }
      }

      let andWhere = {}
      // 从 ClsService 中获取的，表示当前操作的 ID
      const operateId = this.cls.get('operateId')
      // 如果是编辑操作，则排除自身，以确保在编辑时不验证当前记录的唯一性。
      if (operateId) {
        // andWhere 用来构建查询条件，如果 operateId 存在，则排除该 ID
        // Not 查找选项操作符，用于否定表达式。例如 { title: not(“hello”) } 将返回 title 不等于 “hello ”的实体。
        andWhere = { id: Not(operateId) }
      }

      // 通过查询数据库检查该字段的值是否唯一。如果查询结果为 null，说明值是唯一的，验证通过。
      return isNil(
        await repo.findOne({
          where: { [condition.field]: value, ...andWhere },
        }),
      )
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (err) {
      // 如果数据库操作异常，则验证失败，返回 false。
      return false
    }
  }

  // 当验证失败时，返回默认的错误信息
  defaultMessage(args: ValidationArguments) {
    // 解构了 args.constraints[0]，获取实体（entity）、字段（field）和自定义消息（message）。
    const { entity, field, message } = args.constraints[0] as Condition
    const queryProperty = field ?? args.property

    // if (!(args.object as any).getManager)
    //   return 'getManager function not been found!'

    if (!entity)
      return '未指定实体!'

    if (message) {
      return message
    }

    // return `${queryProperty} of ${entity.name} must been unique!`
    return `${entity.name}的${queryProperty}必须是唯一的!`
  }
}

/**
 * 数据唯一性验证
 * @param entity Entity类或验证条件对象
 * @param validationOptions
 */
function IsUnique(
  entity: ObjectType<any>,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsUnique(
  condition: Condition,
  validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void

function IsUnique(
  params: ObjectType<any> | Condition,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [params],
      validator: UniqueConstraint,
    })
  }
}

export { IsUnique }
