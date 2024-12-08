import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'

import { Exclude } from 'class-transformer'
import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, VirtualColumn } from 'typeorm'

// AbstractEntity 类，用于在基于 TypeORM 和 NestJS 的项目中提供实体的通用特性，如 ID、创建时间和更新时间，并支持将实体转换为数据传输对象 (DTO)。
export abstract class AbstractEntity extends BaseEntity {
  // 用于定义一个主键列，类型为 UUID（全局唯一标识符），数据库会自动生成该字段。
  @PrimaryGeneratedColumn('uuid', { comment: 'UUID' })
  id!: Uuid

  @Exclude()
  // 用于定义创建时间列，每次插入新记录时，该字段会自动设置为当前时间。
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt!: Date

  @Exclude()
  // 用于定义更新时间列，每次更新记录时，该字段会自动更新为当前时间。
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt!: Date
}

export abstract class CompleteEntity extends AbstractEntity {
  @ApiHideProperty()
  @Exclude()
  // update 设置为 false，表示该字段不会在更新操作时被更新，只有在第一次插入时会被设置，只用于记录创建者。
  // nullable 设置为 true，表示该字段可以为 null。
  @Column({ type: 'uuid', update: false, comment: '创建者', nullable: true })
  createBy: Uuid

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'uuid', comment: '更新者', nullable: true })
  updateBy: Uuid

  /**
   * 不会保存到数据库中的虚拟列，数据量大时可能会有性能问题，有性能要求请考虑在 service 层手动实现
   * @see https://typeorm.io/decorator-reference#virtualcolumn
   */
  @ApiProperty({ description: '创建者' })
  @VirtualColumn({ query: alias => `SELECT username FROM user WHERE id = ${alias}.createBy` })
  creator: string

  @ApiProperty({ description: '更新者' })
  @VirtualColumn({ query: alias => `SELECT username FROM user WHERE id = ${alias}.updateBy` })
  updater: string
}
