// UseDto 用于添加 dtoClass 属性
export function UseDto(dtoClass: Constructor): ClassDecorator {
  return (ctor) => {
    // FIXME make dtoClass function returning dto

    if (!(dtoClass as unknown)) {
      throw new Error('UseDto decorator requires dtoClass')
    }

    ctor.prototype.dtoClass = dtoClass
  }
}
