import { ClsServiceManager } from 'nestjs-cls'

import { UserEntity } from '~/modules/user/user.entity'

// ContextProvider 用于管理与当前请求相关的上下文数据。
// 依赖于 nestjs-cls 提供的 CLS（Continuable Local Storage） 功能，以便在应用程序的生命周期内跨多个异步操作共享数据，尤其是在请求处理过程中。
// 其中，包含了一些与用户身份验证和请求上下文相关的静态方法。它的作用是通过 CLS 在应用的请求生命周期中共享和存取当前的用户数据。
// 应用场景如下：
// > 当用户通过身份验证时，拦截器或守卫可以使用 ContextProvider.setAuthUser() 将认证用户存储在 CLS 中。
// > 后续的服务、控制器或其他中间件可以通过 ContextProvider.getAuthUser() 来获取当前用户的信息，无需通过函数参数传递或依赖注入来获取。
export class ContextProvider {
  // nameSpace 表示命名空间前缀，值为 'request'。用于将存储的键与请求上下文相关联。这确保存储的值不会与其他请求发生冲突。
  private static readonly nameSpace = 'request'

  // authUserKey 表示用于存储认证用户的键，值为 'user_key'。这个键用来标识在 CLS 中存储的用户信息。
  private static readonly authUserKey = 'user_key'

  // 用于从 CLS 存储中获取数据。
  private static get<T>(key: string) {
    // 获取当前请求的 CLS 服务实例。
    // getClsService() 方法返回一个与当前请求相关联的存储对象。可以使用这个存储对象来存取请求范围内的变量。
    const store = ClsServiceManager.getClsService()

    // 使用 store.get<T>() 方法，通过带有命名空间的键来获取存储的值。
    return store.get<T>(ContextProvider.getKeyWithNamespace(key))
  }

  // 用于将数据存储在 CLS 中
  private static set(key: string, value: any): void {
    // 获取当前请求的 CLS 服务实例。
    const store = ClsServiceManager.getClsService()

    // 使用 store.set() 方法，传入带有命名空间的键和要存储的值，将值保存到 CLS 中。
    return store.set(ContextProvider.getKeyWithNamespace(key), value)
  }

  // 接受一个键（key）作为参数，并将其与命名空间（nameSpace）进行组合。结果是 request.user_key 这样的字符串，用于区分不同的请求上下文。
  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.nameSpace}.${key}`
  }

  // 用于将经过身份验证的用户（UserEntity 实例）存储到当前的 CLS 上下文中。
  static setAuthUser(user: UserEntity): void {
    ContextProvider.set(ContextProvider.authUserKey, user)
  }

  // 用于从 CLS 上下文中获取当前经过身份验证的用户。
  static getAuthUser(): UserEntity | undefined {
    return ContextProvider.get<UserEntity>(ContextProvider.authUserKey)
  }
}
