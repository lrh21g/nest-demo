import { ObjectLiteral } from 'typeorm'

// declare 关键字用来告诉编译器，某个类型是存在的，可以在当前文件中使用，不用给出具体实现。
// declare 只能用来描述已经存在的变量和数据结构，不能用来声明新的变量和数据结构。
// 使用 declare module 为外部模块 typeorm 添加属性和方法时，给出新增部分的类型描述。
declare module 'typeorm' {
  // 对 typeORM 的 SelectQueryBuilder 类进行扩展，添加了一些自定义的方法和类型定义
  // SelectQueryBuilder 用于构建 SQL 查询
  interface SelectQueryBuilder<Entity> {
    // 允许在指定的列上，根据搜索字符串进行搜索
    // options 参数可以配置是否从字符串的开始进行匹配
    searchByString: (
      q: string,
      columnNames: string[],
      options?: {
        formStart: boolean
      },
    ) => this

    // 用于处理分页逻辑，接收 PageOptionsDto 对象和其他可选参数。返回一个 Promise，包含一个数组（实体）和分页元数据（PageMetaDto）
    paginate: (
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{ takeAll: boolean, skipCount: boolean }>,
    ) => Promise<[Entity[], PageMetaDto]>

    // 扩展了 leftJoin 和 leftJoinAndSelect 方法，用于左连接查询，允许使用类型安全的属性和别名。
    // leftJoinAndSelect: <AliasEntity extends AbstractEntity, A extends string>(
    //   this: SelectQueryBuilder<Entity>,
    //   property: `${A}.${Exclude<
    //     KeyOfType<AliasEntity, AbstractEntity>,
    //     symbol
    //   >}`,
    //   alias: string,
    //   condition?: string,
    //   parameters?: ObjectLiteral,
    // ) => this

    leftJoin: <AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ) => this

    // 扩展了 innerJoin 和 innerJoinAndSelect 方法，用于内连接查询，功能类似于左连接。
    // innerJoinAndSelect: <AliasEntity extends AbstractEntity, A extends string>(
    //   this: SelectQueryBuilder<Entity>,
    //   property: `${A}.${Exclude<
    //     KeyOfType<AliasEntity, AbstractEntity>,
    //     symbol
    //   >}`,
    //   alias: string,
    //   condition?: string,
    //   parameters?: ObjectLiteral,
    // ) => this

    innerJoin: <AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ) => this
  }
}
