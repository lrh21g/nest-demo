import { Reflector } from '@nestjs/core'

// Roles 将角色信息与路由处理方法或类关联起来，通常用于实现权限控制
// 通过 Reflector.createDecorator<string[]>()，生成的 Roles 装饰器可以附加在类或方法上，标记该类或方法需要特定的角色才能访问。
// 通常，Roles 装饰器会与角色守卫（guard）结合使用，以确保只有具有正确角色的用户才能访问某些资源。
// > createDecorator 用于创建一个自定义的装饰器。此处，会接受并存储一个字符串数组，字符串数组通常用来表示角色（例如，['admin', 'user']），用于权限控制。
export const Roles = Reflector.createDecorator<string[]>()
