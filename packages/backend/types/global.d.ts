// 使用 declare global {}语法为 JavaScript 引擎的原生对象添加属性和方法。
declare global {
  // 定义了一个名为 Uuid 的类型，表示一个字符串类型的 UUID（通用唯一标识符）。
  export type Uuid = string & { _uuidBrand: undefined }

  // 定义了一个名为 Todo 的类型，表示一个待办事项
  export type Todo = any & { _todoBrand: undefined }

  // 通过扩展 Array 接口，添加了一些自定义方法
  interface Array<T> {
    // 允许将数组中的元素转换为 DTO（数据传输对象）。
    // 接收一个可选的 options 参数，并返回一个 DTO 数组。
    toDtos: <Dto extends AbstractDto>(this: T[], options?: unknown) => Dto[]

    // 允许将数组转换为分页 DTO。
    // 接收一个 PageMetaDto 参数（包含分页元数据）和可选的 options 参数，并返回一个 PageDto<Dto>。
    toPageDto: <Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
      // FIXME make option type visible from entity
      options?: unknown,
    ) => PageDto<Dto>
  }
}

export {}