import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

import { AbstractDto } from './dtos/abstract.dto'

// AbstractEntity 类，用于在基于 TypeORM 和 NestJS 的项目中提供实体的通用特性，如 ID、创建时间和更新时间，并支持将实体转换为数据传输对象 (DTO)。
export abstract class AbstractEntity<
  // 继承自 AbstractDto 的 DTO 类型，默认为 AbstractDto （ DTO（数据传输对象）的抽象类，定义了实体转换为 DTO 的基础结构。 ）
  DTO extends AbstractDto = AbstractDto,
  // 泛型参数，默认为 never，通常用于传递一些额外的选项。
  O = never,
> {
  // 用于定义一个主键列，类型为 UUID（全局唯一标识符），数据库会自动生成该字段。
  @PrimaryGeneratedColumn('uuid')
  id!: Uuid

  // 用于定义创建时间列，每次插入新记录时，该字段会自动设置为当前时间。
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  // 用于定义更新时间列，每次更新记录时，该字段会自动更新为当前时间。
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  // 将实体转换为 DTO 的方法，使用实体类的 dtoClass 来实例化一个 DTO。
  toDto(options?: O): DTO {
    // 获取当前实体类的 dtoClass，是在类中定义的一个属性，用来指定对应的 DTO 类。
    const DtoClass = this.constructor.prototype.dtoClass

    if (!DtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      )
    }

    // 如果 DtoClass 存在，则调用 DTO 类的构造函数，传入当前实体实例 (this) 和可选的 options，将实体转换为对应的 DTO 实例并返回。
    return new DtoClass(this, options)
  }
}
