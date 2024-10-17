// 生成一个字符串字面量类型，表示对象的所有嵌套键路径
// eg:
// type Keys = NestedKeyOf<{ a: { b: { c: string } }>
// => 'a' | 'a.b' | 'a.b.c'
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)]

// 生成一个映射类型，其中每个嵌套键路径对应于其在 T 中的属性类型
type RecordNamePaths<T extends object> = {
  [K in NestedKeyOf<T>]: PropType<T, K>
}

// 定义一个构造函数类型，允许使用泛型指定返回类型和参数类
type Constructor<T = any, Arguments extends unknown[] = any[]> = new (
  ...arguments_: Arguments
) => T

// 获取一个对象类型中所有值为特定类型 U 的键
type KeyOfType<Entity, U> = {
  // Required<Type>返回一个新类型，将参数类型 Type 的所有属性变为必选属性。它与Partial<Type>的作用正好相反。
  [P in keyof Required<Entity>]: Required<Entity>[P] extends U
    ? P
    : Required<Entity>[P] extends U[]
      ? P
      : never;
}[keyof Entity]
