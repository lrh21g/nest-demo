# @nest-demo/backend

## 项目启动

- 使用 pnpm 安装依赖并启动项目

```bash
# 使用 pnpm 安装依赖
$ pnpm install
```

- 编译并运行项目

```bash
# 编译并运行项目
$ pnpm run start

# 编译并运行项目，运行在监视模式下（实时重新加载）
$ pnpm run start:dev

# 编译并运行项目，以调试模式运行
$ pnpm run start:debug
```

- 项目打包

```bash
# 编译并打包项目
$ pnpm run build

# 运行打包项目
$ pnpm run start:prod
```

- 数据库迁移

```bash
# 更新数据库(或初始化数据)
$ pnpm run migration:run

# 生成迁移
$ pnpm run migration:generate

# 回滚
$ pnpm run migration:revert
```

## 目录结构

```text
├─ src # 项目主目录
│  ├─ common # 公共模块
│  │  ├─ decorators # 装饰器
│  │  ├─ dtos # DTO（数据传输对象）
│  │  ├─ exceptions # 异常类
│  │  ├─ filters # 过滤器
│  │  ├─ guards # 守卫
│  │  ├─ interceptors # 拦截器
│  │  ├─ middlewares # 中间件
│  │  ├─ pipes # 管道
│  │  └─ providers
│  ├─ config # 基础配置
│  ├─ constants # 常量配置
│  ├─ modules # 功能模块
│  ├─ share # 公共服务
│  │  ├─ database # 数据库服务
│  │  │  ├─ entity-subscribers # 事件订阅
│  │  │  └─ migrations # 迁移
│  │  └─ logger # 日志服务
│  ├─ utils # 工具函数
│  ├─ app.module.ts
│  ├─ boilerplate.polyfill.ts
│  ├─ env.ts
│  ├─ env.validation.ts
│  ├─ main.ts
│  ├─ setup-swagger.ts
├─ test
├─ types
├─ .env.development
├─ .env.production
├─ nest-cli.json
├─ nest-private.key
├─ nest-public.key
├─ package.json
├─ README.md
├─ tsconfig.build.json
└─ tsconfig.json
```
