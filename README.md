# nest-demo

## 项目命令

- docker 相关

```bash
# 指定的开发 Docker Compose 文件（docker-compose.dev.yml），使用开发环境的环境变量文件（.env.development） 启动 MySql 服务
# > docker compose -f : 指定 Docker Compose 文件
# > docker compose --env-file : 指定环境文件
# > docker compose run : 运行一个一次性容器
# > docker compose run -d : 在后台运行容器并打印容器 ID
# > docker compose run --service-ports : 在启用所有服务端口并将其映射到主机的情况下运行命令
$ docker compose -f docker-compose.dev.yml --env-file .env.development run -d --service-ports mysql

# 指定的开发 Docker Compose 文件（docker-compose.dev.yml），使用开发环境的环境变量文件（.env.development） 启动 Redis 服务
$ docker compose -f docker-compose.dev.yml --env-file .env.development run -d --service-ports redis

# docker compose -f docker-compose.dev.yml --env-file .env.development up --build
# 指定的开发 Docker Compose 文件（docker-compose.dev.yml），使用开发环境的环境变量文件（.env.development）构建并启动 Docker 容器
# > docker compose -f : 指定 Docker Compose 文件
# > docker compose --env-file : 指定环境文件
# > docker compose up --build : 在启动之前重新构建镜像。
$ pnpm run docker:start:dev

# docker compose -f docker-compose.dev.yml --env-file .env.production up --build
# 指定的开发 Docker Compose 文件（docker-compose.dev.yml），使用生产环境的环境变量文件（.env.production）构建并启动 Docker 容器
$ pnpm run docker:start:prod

# docker compose -f docker-compose.dev.yml --env-file .env.production up -d --no-build
# 指定的开发 Docker Compose 文件（docker-compose.dev.yml），使用生产环境的环境变量文件启动容器，但不重新构建镜像，适用于已存在镜像的情况
# > docker compose -f : 指定 Docker Compose 文件
# > docker compose --env-file : 指定环境文件
# > docker compose up -d : 使容器在后台运行
# > docker compose up --no-build : 不重新构建镜像
$ pnpm run docker:dev:up

# docker compose -f docker-compose.prod.yml --env-file .env.production up -d --pull=always
# 指定的生产 Docker Compose 文件（docker-compose.prod.yml），使用生产环境的环境变量文件启动容器
# > docker compose -f : 指定 Docker Compose 文件
# > docker compose --env-file : 指定环境文件
# > docker compose up -d : 使容器在后台运行
# > docker compose up --pull=always : 确保每次启动前都会拉取最新的基础镜像。可选项： always | missing | never
$ pnpm run docker:prod:up

# docker compose --env-file .env.production down
# 使用生产环境的环境变量文件，停止并删除 Docker 容器和网络。适用于清理正在运行的服务
# > docker compose --env-file : 指定环境文件
# > docker compose down : 停止并移除容器、网络
$ pnpm run docker:down

# docker compose --env-file .env.production stop nest-demo-backend && docker container rm nest-demo-backend && docker rmi nest-demo-backend
# 停止名为 nest-demo-backend 的容器，删除该容器，并删除与之相关的 Docker 镜像。适用于清理不再需要的资源。
# > docker compose --env-file : 指定环境文件
# > docker compose stop : 停止正在运行的容器，但不删除它们。可以通过 docker compose start 重新启动。
# > docker container rm : 删除已停止的服务容器
# > docker rmi : 删除镜像
$ pnpm run docker:rmi
```

## 目录结构

```plain
├─ .changeset # 用于进行自动化版本控制和包发布相关任务的配置
├─ .vscode # 用于指定在使用 Visual Studio Code 时使用的特定设置
├─ packages
│   ├─ backend # 后端服务
│   └─ frontend # 前端应用
├─ .cz-config.js # 用于指定在使用 Commitizen 时使用的特定设置
├─ .editorconfig  # 编辑器读取文件格式及样式定义配置 http://editorconfig.org
├─ .gitattributes # 自定义指定文件属性
├─ .gitignore # git 提交忽略文件
├─ .hintrc
├─ .lintstagedrc  # lint-staged 配置
├─ .markdownlint.json  # markdown 格式检查配置
├─ .npmrc # npm 配置文件
├─ .nvmrc # 用于指定在使用 Node Version Manager（NVM）时要使用的特定 Node.js 版本
├─ .prettierignore # prettier 语法检查忽略文件
├─ .prettierrc.js # prettier 插件配置
├─ commitlint.config.js # git 提交前检查配置
├─ eslint.config.js # eslint 语法检查配置
├─ package.json # 依赖包管理以及命令配置
├─ pnpm-lock.yaml # 依赖包版本锁定文件
├─ pnpm-workspace.yaml # pnpm 工作空间配置
├─ README.md # README
├─ stylelint.config.js # stylelint 配置
└─ tsconfig.json # typescript 配置
```
