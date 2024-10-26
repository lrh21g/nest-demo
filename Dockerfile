# pnpm - 在 Docker 中构建包： https://pnpm.io/docker

# FROM 指令 : 初始化一个新的构建阶段，并为后续指令设置基础镜像。
# 可选择在 FROM 指令中添加 AS 名称，为新的构建阶段命名。该名称可用于后续的 FROM <name>、COPY --from=<name> 和 RUN --mount=type=bind,from=<name> 指令，以引用此阶段构建的映像。
FROM node:20.18-slim AS base

# ARG 指令 : 使用构建时变量
ARG NODE_ENV
ARG APP_PROJECT_DIR
ARG APP_BACKEND_PORT
ARG APP_FRONTEND_PORT
ARG DB_HOST
ARG DB_PORT

# ENV 指令 : 设置环境变量
# 设置环境变量。其中， \ 为行续符，用于在多行中连接命令
# TZ 为时区变量
# PNPM_HOME 为 pnpm 的安装目录，用于存储 pnpm 的缓存或全局安装的包
# PATH 为更新环境变量 PATH 的值。将 pnpm 的安装目录（PNPM_HOME）添加到 PATH 中，容器在执行命令时可以首先在 pnpm 目录中查找可执行文件，使得 pnpm 等工具能够直接运行而无需指定完整路径
ENV TZ=Asia/Shanghai \
  PNPM_HOME="/pnpm" \
  PATH="$PNPM_HOME:$PATH" \
  HUSKY=0

# RUN 指令 : 执行构建命令。在当前镜像之上创建一个新层，添加的层将用于 Dockerfile 的下一步。
# 此处，执行设置时区
# > 使用 ln -sf : 创建符号链接。将 /etc/localtime 链接到对应时区的时区信息文件（/usr/share/zoneinfo/${TZ}）
# > 通过 echo 将当前时区（${TZ}）写入 /etc/timezone 文件。这为一些应用程序提供了时区信息，以便它们可以正确处理时间和日期。
RUN ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime \
  && echo ${TZ} > /etc/timezone

# 启用 corepack
# 启用 corepack （用于管理 JavaScript 包管理器的工具）使其可以在当前环境中使用。它会自动配置和设置包管理器（如 Yarn 或 pnpm），并确保它们的版本与项目的依赖关系保持一致。
RUN corepack enable
RUN yarn global add pm2
RUN yarn global add dotenv

# pnpm 镜像加速
RUN pnpm config set registry https://registry.npmmirror.com
# pnpm 切回官方源
# pnpm config set registry https://registry.npmjs.org
# RUN npm config rm proxy && npm config rm https-proxy

# ========================================

FROM base AS build

# COPY 指令 : 复制文件和目录
# 此处，将本地的文件和目录复制到 Docker 镜像中的指定位置。
COPY ./ $APP_PROJECT_DIR

# WORKDIR 指令 : 设置工作目录
# WORKDIR 为 Dockerfile 中的任何 RUN、CMD、ENTRYPOINT、COPY 和 ADD 指令设置工作目录。
# > 如果没有指定，默认工作目录是 /。
# > 如果 WORKDIR 不存在，即使在随后的 Dockerfile 指令中没有使用，它也会被创建
# > WORKDIR 指令可以在 Dockerfile 中多次使用。如果提供了相对路径，它将相对于上一条 WORKDIR 指令的路径。
WORKDIR $APP_PROJECT_DIR

# 用于从 package.json 文件中删除 scripts 对象下的 prepare 脚本
# 安装依赖时，不会自动运行 prepare 脚本
RUN npm pkg delete scripts.prepare

# 使用 Docker BuildKit 的缓存机制，安装生产依赖
# RUN --mount=type=cache : Docker BuildKit 的一个特性，用来挂载缓存目录。它能够缓存特定路径的文件，以便在未来的构建中重用，从而加速构建过程。
# id=pnpm : 缓存的标识符，给缓存设置一个唯一的名称。相同 ID 的缓存可以跨多次构建共享。
# target=/pnpm/store : 挂载缓存的目标路径， /pnpm/store 是 pnpm 用来存储包文件的缓存目录。
# pnpm install : 用于安装项目的所有依赖项。在 pnpm-workspace 中，pnpm install 会安装所有项目中的所有依赖项。
# --prod : 如果设置，pnpm 将忽略 NODE_ENV，而使用此布尔值来确定环境。
# > 如果为 true，pnpm 将不安装 devDependencies 中列出的任何软件包，并删除已经安装的软件包。
# > 如果为 false，pnpm 将安装 devDependencies 和依赖项中列出的所有软件包。
# --frozen-lockfile
# > 如果为 true，pnpm 不会生成锁文件（pnpm-lock.yaml），并且在锁文件与清单不同步/需要更新或没有锁文件的情况下会导致安装失败。
# > 在 CI 环境中，此设置默认为 true 。
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run -r build
# # 判断环境变量，执行对应编译打包命令
# RUN if [ "$NODE_ENV" = "development" ]; then \
#     pnpm run -r dev; \
#   fi
# RUN if [ "$NODE_ENV" = "production" ]; then \
#     pnpm run -r build; \
#   fi

# pnpm --filter=<deployed project name> --prod deploy <target directory>
# pnpm deploy : 从工作区部署软件包。
# 在部署过程中，已部署软件包的文件会被复制到目标目录。已部署软件包的所有依赖项（包括来自工作区的依赖项）都会安装在目标目录下的隔离 node_modules 目录中。目标目录将包含一个可移植的软件包，可以复制到服务器上执行，无需额外步骤。
# --filter : 可按名称或关系选择软件包
# --prod : 不会安装 devDependencies 中的软件包。
RUN pnpm --filter=backend deploy /app/backend
RUN pnpm --filter=frontend deploy /app/frontend

# ========================================

# 定义名为 backend 的构建阶段，基于之前定义的基础镜像 base
# 用于安装生产环境所需的依赖，减小最终镜像的体积
FROM base AS backend

# COPY --from=<stage_name> <source_path> <destination_path>
# --from=<stage_name> : 指定要复制的构建阶段名称。<stage_name> 是之前定义的构建阶段的名称（例如 base）
# <source_path> : 指定要复制的源文件或目录路径，通常相对于指定构建阶段的上下文。
# <destination_path> : 指定要复制的目标路径，表示在当前镜像中的放置位置。
# 此处表示从 build 构建阶段复制 /backend 目录到最终镜像中的相同位置。该目录通常包含经过构建的应用文件，准备部署到生产环境。
COPY --from=build /app/backend/ /app/backend/
COPY --from=build $APP_PROJECT_DIR/wait-for-it.sh /app/backend

WORKDIR /app/backend

# EXPOSE 指令 : 通知 Docker，容器在运行时监听指定的网络端口。如果没有指定协议，默认为 TCP。
EXPOSE $APP_BACKEND_PORT

RUN chmod +x ./wait-for-it.sh

# CMD 指令 : 指定容器启动时运行的命令。
# CMD command param1 param2 或者 CMD ["executable","param1","param2"]
# CMD node ./dist/main.js
# CMD pnpm run start:prod
# CMD pm2-runtime ./ecosystem.config.js

# ENTRYPOINT 指令 : 指定默认可执行文件
# ENTRYPOINT command param1 param2 或者 ENTRYPOINT ["executable", "param1", "param2"]
ENTRYPOINT ./wait-for-it.sh $DB_HOST:$DB_PORT -s -- pm2-runtime ./ecosystem.config.js

# ========================================

# 定义名为 frontend 的构建阶段，基于之前定义的基础镜像 base
# 安装所有依赖并构建应用，生成用于生产的输出文件
# FROM base AS frontend
# COPY --from=build /app/frontend /app/frontend
# WORKDIR /app/frontend
# EXPOSE $APP_FRONTEND_PORT

# ========================================
