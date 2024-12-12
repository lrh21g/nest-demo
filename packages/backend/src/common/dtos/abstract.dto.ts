import { DateField, UUIDField } from '../decorators'
import { AbstractEntity } from '../entity/abstract.entity'

// AbstractDto 为 DTO（数据传输对象）的抽象类，定义了实体转换为 DTO 的基础结构。用于在不同层之间传递实体的核心字段数据（如 id、createdAt 和 updatedAt）。
export class AbstractDto {
  @UUIDField({ description: 'UUID' })
  id!: Uuid // UUID 类型的标识符，标识每个 DTO 的唯一性

  @DateField({ description: '创建时间' })
  createdAt!: Date // 记录实体的创建时间

  @DateField({ description: '更新时间' })
  updatedAt!: Date // 记录实体的最后更新时间

  // 构造函数接收一个 AbstractEntity 实体作为参数，并将其字段值映射到 DTO 对象。
  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    // 如果 options.excludeFields 为 true，则不会从实体中复制字段的值；如果为 false（默认值），则会自动复制 id、createdAt 和 updatedAt 字段。
    if (!options?.excludeFields) {
      this.id = entity.id
      this.createdAt = entity.createdAt
      this.updatedAt = entity.updatedAt
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true })
  }
}
