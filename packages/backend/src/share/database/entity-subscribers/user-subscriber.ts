import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm'

import { UserEntity } from '~/modules/user/user.entity'
import { generateHash } from '~/utils'

// EventSubscriber 将一个类标记为事件订阅者，可以监听特定实体事件或任何实体的事件。事件是使用 QueryBuilder 和 repository / manager 方法触发的。
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  // 返回将监听事件的实体类。如果省略此方法，则订阅者将监听所有实体的事件
  listenTo(): typeof UserEntity {
    return UserEntity
  }

  // 实体插入数据库前调用
  beforeInsert(event: InsertEvent<UserEntity>): void {
    if (event.entity.password) {
      event.entity.password = generateHash(event.entity.password)
    }
  }

  // 在数据库更新实体前调用
  beforeUpdate(event: UpdateEvent<UserEntity>): void {
    const entity = event.entity as UserEntity

    if (entity.password !== event.databaseEntity.password) {
      entity.password = generateHash(entity.password!)
    }
  }
}
